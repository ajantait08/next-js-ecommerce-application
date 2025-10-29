"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setMessage(data.message || "Invalid credentials");
      }
    } catch {
      setMessage("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500 p-4 rounded-full">
            <FaUser className="text-white text-3xl" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border rounded-full px-3 py-2">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Username"
              value={formData.email}
              onChange={handleChange}
              className="w-full outline-none"
              required
            />
          </div>

          <div className="flex items-center border rounded-full px-3 py-2">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full outline-none"
              required
            />
          </div>

          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <label className="flex items-center gap-1">
              <input type="checkbox" className="accent-blue-500" /> Remember me
            </label>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => alert('Forgot password feature coming soon')}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>

          {message && (
            <p className="text-center text-red-500 text-sm mt-3">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
