"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // ако нямаш lucide-react: npm install lucide-react

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          Event Management
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          <Link
            href="/"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Register
          </Link>
        </div>

        {/* Hamburger button (mobile) */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 hover:text-indigo-600"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 space-y-2">
          <Link
            href="/"
            className="block text-gray-700 hover:text-indigo-600 transition"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="block text-gray-700 hover:text-indigo-600 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block text-gray-700 hover:text-indigo-600 transition"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
