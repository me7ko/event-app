"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getToken } from "../utils/auth";

export default function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state for search/sort
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" | "desc"

  const router = useRouter();

  const fetchEvents = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/events", {
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
      fetchEvents(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to delete event");
        return;
      }
      // Оптимистично премахване от state
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error deleting event");
    }
  };

  // Филтриране + сортиране (клиентска логика)
  const visibleEvents = useMemo(() => {
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
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
            onClick={() => router.push("/dashboard/create")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            + Create Event
          </button>
        </div>
      </div>

      {/* List */}
      {visibleEvents.length === 0 ? (
        <p className="text-gray-600">No events found.</p>
      ) : (
        <ul className="space-y-4">
          {visibleEvents.map((event) => (
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
                  onClick={() => router.push(`/dashboard/${event.id}`)}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  View
                </button>
                <button
                  onClick={() => router.push(`/dashboard/edit/${event.id}`)}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
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
    </div>
  );
}
