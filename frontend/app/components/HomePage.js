"use client";

// app/page.js
import Image from "next/image";
import HomePhoto from "../../public/HomePhoto.jpg";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-white min-h-screen px-6 py-16 sm:px-12">
      {/* Hero section */}
      <div className="max-w-screen-xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Text content */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
            Welcome to <span className="text-indigo-600">Event Management</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Easily plan, track, and manage all your events in one place.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <Link href="/login">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition cursor-pointer">
                Login
              </button>
            </Link>

            <Link href="/register">
              <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-100 transition cursor-pointer">
                Register
              </button>
            </Link>
          </div>
        </div>

        <div className="flex-1">
          <Image
            src={HomePhoto}
            alt="Planning team"
            className="rounded-xl shadow-xl"
            priority
          />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Feature
          icon="📅"
          title="Plan Events"
          description="Create, organize and schedule your events effortlessly."
        />
        <Feature
          icon="🔐"
          title="Secure Access"
          description="Login and manage your events securely."
        />
        <Feature
          icon="🔔"
          title="Stay Updated"
          description="Get notified about your upcoming events and changes."
        />
      </div>
    </main>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="p-6 border border-gray-200 rounded-xl text-center hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}
