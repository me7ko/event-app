"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../utils/auth";
import { useToast } from "../../context/ToastContext";

export default function CreateEventPage() {
  const router = useRouter();
  const { push } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    maxAttendees: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim() || !form.date || !form.location.trim()) {
      return "Name, datetime and location are required.";
    }
    const eventDate = new Date(form.date);
    if (Number.isNaN(eventDate.getTime())) {
      return "Invalid date.";
    }
    if (eventDate.getTime() <= Date.now() + 60_000) {
      return "Event date must be in the future.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      push("error", validationError);
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          datetime: form.date, // бекендът очаква 'datetime'
          location: form.location,
          max_attendees: form.maxAttendees || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || "Failed to create event.";
        setError(msg);
        push("error", msg);
        return;
      }

      push("success", "Event created successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      const msg = "Something went wrong. Please try again.";
      setError(msg);
      push("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Create New Event
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Event Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700">Date and Time *</label>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Location *</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">
            Max Attendees (optional)
          </label>
          <input
            type="number"
            name="maxAttendees"
            value={form.maxAttendees}
            onChange={handleChange}
            min={1}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
