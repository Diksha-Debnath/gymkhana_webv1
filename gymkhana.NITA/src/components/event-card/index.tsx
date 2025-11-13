'use client';

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineExternalLink, HiOutlineTrash } from "react-icons/hi";
import type { Event } from "~/types";

interface Props {
  event: Event;
  onDelete: (id: number) => void;
}

function formatDisplayDateRange(start?: string, end?: string) {
  if (!start || !end) return "";
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const opts = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    } as const;
    return `${startDate.toLocaleString(undefined, opts)} — ${endDate.toLocaleString(
      undefined,
      opts
    )}`;
  } catch {
    return "";
  }
}

const EventCard = ({ event, onDelete }: Props) => {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [auth, setAuth] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = () => setShowAuth(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuth({ ...auth, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async () => {
    if (!auth.username || !auth.password) {
      alert("Please enter username and password");
      return;
    }
    setLoading(true);
    try {
      const authRes = await fetch("https://gymkhana-web.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auth),
      });
      if (!authRes.ok) {
        alert("Invalid login credentials");
        setLoading(false);
        return;
      }
      const { token } = await authRes.json();
      const delRes = await fetch(`https://gymkhana-web.onrender.com/api/events/${event.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!delRes.ok) {
        const err = await delRes.json();
        if (delRes.status === 404) {
          alert("This event does not exist anymore or was already deleted.");
        } else {
          alert(err.message || "Failed to delete event");
        }
      } else {
        alert("Event deleted successfully");
        setShowAuth(false);
        onDelete(event.id);
      }
    } catch {
      alert("Network error during deletion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div
  className="relative flex flex-col rounded-2xl shadow border border-gray-300 bg-white p-7 overflow-hidden"
  style={{ backdropFilter: "none", borderLeft: "2px solid rgba(241, 236, 236, 0.5)" }}
>
  <button
    onClick={handleDeleteClick}
    aria-label="Delete event"
    className="absolute bottom-2 right-2 text-red-400 hover:text-red-800 transition"
  >
    <HiOutlineTrash size={22} />
  </button>

  <div className="mb-4 z-10">
    <div className="mb-1 flex items-center gap-3">
      <span className="text-3xl font-extrabold text-black tracking-tight">
        {event.hostingAuthority}
      </span>
      <span className="text-sm px-3 py-1 bg-black text-white rounded-full font-semibold shadow-md ml-auto">
        {event.venue}
      </span>
    </div>
    <div className="w-full h-0.5 mb-3 rounded bg-gradient-to-r from-black via-blue-800 to-black" />
    <div className="text-gray-900 text-lg font-semibold italic mb-3">
      {formatDisplayDateRange(event.startTime, event.endTime)}
    </div>
    <div className="text-gray-800 text-base mb-5 leading-relaxed line-clamp-4">
      {event.description}
    </div>
    {event.registrationForm && (
  <div className="mt-4">
    <Link
      href={event.registrationForm}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-blue-700 font-medium border border-blue-700 rounded-md px-4 py-1 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
      aria-label="Registration form link"
    >
      Register Here
      <HiOutlineExternalLink className="ml-2 w-4 h-4" />
    </Link>
  </div>
)}

  </div>
</div>



      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 shadow-lg">
            <h3 className="text-xl font-bold text-center">Authenticate to Delete</h3>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={auth.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={auth.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowAuth(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthSubmit}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;
