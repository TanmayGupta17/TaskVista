"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import KanbanBoard from "@/Components/board/KanbanBoard";
import LoadingSpinner from "@/Components/ui/LoadingSpinner";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { connected } = useSocket();

  useEffect(() => {
    // Check for token in localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userData =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!token) {
      router.push("/auth/login");
    } else {
      setUser(userData ? JSON.parse(userData) : null);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="px-10 py-4">
          <div className=" flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome, {user?.username}!
              </h1>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white w-20 h-10 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <KanbanBoard />
    </div>
  );
}
