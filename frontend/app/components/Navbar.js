"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getToken } from "../utils/auth";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = getToken();
    setHasToken(!!token);
  }, [isAuthenticated]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          Event Management
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="text-gray-700 hover:text-indigo-600">
            Home
          </Link>

          {hasToken && (
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-indigo-600"
            >
              Dashboard
            </Link>
          )}

          {hasToken ? (
            <button
              onClick={logout}
              className="text-gray-700 hover:text-indigo-600 cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-gray-700 hover:text-indigo-600"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
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
          <Link href="/" className="block text-gray-700 hover:text-indigo-600">
            Home
          </Link>

          {hasToken && (
            <Link
              href="/dashboard"
              className="block text-gray-700 hover:text-indigo-600"
            >
              Dashboard
            </Link>
          )}

          {hasToken ? (
            <button
              onClick={logout}
              className="block text-gray-700 hover:text-indigo-600 cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-gray-700 hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block text-gray-700 hover:text-indigo-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
