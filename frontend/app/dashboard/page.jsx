"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getToken } from "../utils/auth";

const PAGE_SIZE = 3;
const API = "http://localhost:5000";

export default function DashboardPage() {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" | "desc"
  const [page, setPage] = useState(1);

  // дръпни ВСИЧКИ евенти наведнъж (голям лимит)
  const fetchAllEvents = async (token) => {
    try {
      const url = new URL("/api/events", API);
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", "1000"); // достатъчно голям лимит

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      fetchAllEvents(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Филтриране + сортиране (клиентска логика)
  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = q
      ? events.filter((e) => {
          const name = (e.name || "").toLowerCase();
          const location = (e.location || "").toLowerCase();
          return name.includes(q) || location.includes(q);
        })
      : events;

    const sorted = [...filtered].sort((a, b) => {
      const da = new Date(a.datetime).getTime();
      const db = new Date(b.datetime).getTime();
      return sortOrder === "asc" ? da - db : db - da;
    });

    return sorted;
  }, [events, query, sortOrder]);

  // Пагинация (клиентска)
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / PAGE_SIZE)
  );
  const visiblePageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, page]);

  // При смяна на търсене/сортиране → връщаме на стр. 1
  useEffect(() => {
    setPage(1);
  }, [query, sortOrder]);

  // Delete (и оптимистично премахване)
  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`${API}/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || "Failed to delete event");
        return;
      }
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error deleting event");
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      {/* Header + actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Events</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search (без <form>) */}
          <input
            type="text"
            placeholder="Search by name or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              // блокирай Enter да не предизвика навигация
              if (e.key === "Enter") e.preventDefault();
            }}
            className="border rounded-md px-3 py-2 w-full sm:w-64"
          />

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="asc">Sort by date ↑</option>
            <option value="desc">Sort by date ↓</option>
          </select>

          {/* Create */}
          <button
            type="button"
            onClick={() => router.push("/dashboard/create")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            + Create Event
          </button>
        </div>
      </div>

      {/* List */}
      {visiblePageItems.length === 0 ? (
        <p className="text-gray-600">No events found.</p>
      ) : (
        <ul className="space-y-4">
          {visiblePageItems.map((event) => (
            <li
              key={event.id}
              className="p-4 border rounded-md shadow-sm hover:shadow-md transition flex items-start justify-between gap-4"
            >
              <div>
                <h3 className="text-xl font-semibold text-indigo-600">
                  {event.name}
                </h3>
                <p className="text-gray-700">{event.location}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(event.datetime).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/${event.id}`)}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/edit/${event.id}`)}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(event.id)}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination (client-side) */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
