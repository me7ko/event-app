"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "../../../utils/auth";

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    datetime: "",
    location: "",
    max_attendees: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

        const e = data.event;
        // Превръщаме ISO/UTC към value за <input type="datetime-local">
        const dt = new Date(e.datetime);
        const pad = (n) => String(n).padStart(2, "0");
        const dtLocal = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
          dt.getDate()
        )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

        setForm({
          name: e.name || "",
          description: e.description || "",
          datetime: dtLocal,
          location: e.location || "",
          max_attendees: e.max_attendees ?? "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim() || !form.datetime || !form.location.trim()) {
      return "Name, datetime and location are required.";
    }
    const eventDate = new Date(form.datetime);
    if (isNaN(eventDate)) return "Invalid date.";
    if (eventDate.getTime() <= Date.now() + 60_000) {
      return "Event date must be in the future.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      // datetime-local -> ISO (бекендът очаква валиден timestamp)
      const datetimeISO = new Date(form.datetime).toISOString();

      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          datetime: datetimeISO, // <-- важно
          location: form.location,
          max_attendees:
            form.max_attendees === "" ? null : Number(form.max_attendees),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Update failed (${res.status})`);
      }

      // Ако нямаш детайлна страница, върни към списъка
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Error updating event");
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Event</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Event Name *</label>
          <input
            type="text"
            name="name"
            className="w-full border px-3 py-2 rounded-md"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full border px-3 py-2 rounded-md"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-gray-700">Date and Time *</label>
          <input
            type="datetime-local"
            name="datetime"
            className="w-full border px-3 py-2 rounded-md"
            value={form.datetime}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Location *</label>
          <input
            type="text"
            name="location"
            className="w-full border px-3 py-2 rounded-md"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">
            Max Attendees (optional)
          </label>
          <input
            type="number"
            name="max_attendees"
            className="w-full border px-3 py-2 rounded-md"
            min={1}
            value={form.max_attendees}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
