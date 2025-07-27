// components/Footer.jsx
import { FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Event Management. All rights
          reserved.
        </p>

        <div className="flex gap-4 text-sm">
          <a href="/privacy" className="hover:text-indigo-600 transition">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-indigo-600 transition">
            Terms
          </a>
          <a href="/contact" className="hover:text-indigo-600 transition">
            Contact
          </a>
        </div>

        <div className="flex gap-4 text-xl">
          <a
            href="https://www.facebook.com/metko.himself"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600"
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.linkedin.com/in/metko-babuchev-528318255"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com/me7ko"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600"
          >
            <FaGithub />
          </a>
        </div>
      </div>
    </footer>
  );
}
