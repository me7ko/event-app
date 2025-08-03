"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

export default function DashboardPage() {
  const [events, setEvents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      fetchEvents(token);
    }
  }, []);

  const fetchEvents = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setEvents([]);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Events</h1>
        <button
          onClick={() => router.push("/dashboard/create")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          + Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-600">No events found.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li
              key={event.id}
              className="p-4 border rounded-md shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-indigo-600">
                {event.name}
              </h3>
              <p className="text-gray-700">{event.location}</p>
              <p className="text-gray-500 text-sm">
                {new Date(event.datetime).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
