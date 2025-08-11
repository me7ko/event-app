"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "../../utils/auth";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Load event details
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to load event");
        setEvent(data.event);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete event");
      router.push("/dashboard");
    } catch (e) {
      setErr(e.message || "Error deleting event");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {err}
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!event) return null;

  const when = new Date(event.datetime).toLocaleString();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
          <p className="mt-2 text-gray-600">
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
              {when}
            </span>
            <span className="ml-2 inline-block rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-700">
              {event.location}
            </span>
            {event.max_attendees ? (
              <span className="ml-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                Max: {event.max_attendees}
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/dashboard/edit/${event.id}`)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Description
          </h2>
          {event.description ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          ) : (
            <p className="text-gray-500 italic">No description provided.</p>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Detail label="Date & Time" value={when} />
            <Detail label="Location" value={event.location} />
            <Detail label="Max Attendees" value={event.max_attendees ?? "—"} />
            <Detail
              label="Created"
              value={new Date(event.created_at).toLocaleString()}
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => router.push(`/dashboard/edit/${event.id}`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Edit Event
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-gray-800">{value}</div>
    </div>
  );
}
