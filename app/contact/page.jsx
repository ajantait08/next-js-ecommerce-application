"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCartContext } from "@/context/CartContext";

export default function ContactUsPage() {
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;

  if (!storedUser?.id && typeof window !== "undefined") {
    window.location.href = "/auth/login";
    return null;
  }

  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useCartContext();

  // ✅ Validation function
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (!/^[a-zA-Z0-9\s]+$/.test(value))
          error = "Name must contain only letters and spaces";
        break;

      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Valid email is required";
        break;

      case "phone_no":
        if (value && !/^[0-9]{10,15}$/.test(value))
          error = "Phone number must be 10–15 digits";
        break;

      case "message":
        if (!value.trim()) error = "Message is required";
        break;

      default:
        break;
    }

    return error;
  };

  // ✅ Handle live validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const validateAll = () => {
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  // ✅ Check if form is valid
  const isFormValid = () => {
    const hasErrors = Object.values(errors).some((err) => err);
    const hasEmptyRequired =
      !formData.name.trim() || !formData.email.trim() || !formData.message.trim();
    return !(hasErrors || hasEmptyRequired);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setIsSubmitting(true);

    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          user_id: storedUser ? storedUser.id : null,
          user_email: storedUser ? storedUser.email : null,
        }),
      });

      const data = await res.json();
      if (res.status === 200) {
        setSuccessMsg(data.message);
        setFormData({ name: "", phone_no: "", email: "", message: "" });
        setErrors({});
      } else if (data.errors) {
        setErrors(data.errors);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white border rounded-xl shadow-md">
        <h2 className="text-3xl font-semibold text-blue-600 mb-6">Contact Us</h2>

        {successMsg && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block font-medium">Name:</label>
            <input
              type="text"
              name="name"
              className={`w-full p-2 border rounded ${
                errors.name ? "border-red-500" : ""
              }`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block font-medium">Phone No.:</label>
            <input
              type="text"
              name="phone_no"
              className={`w-full p-2 border rounded ${
                errors.phone_no ? "border-red-500" : ""
              }`}
              value={formData.phone_no}
              onChange={handleChange}
            />
            {errors.phone_no && (
              <p className="text-red-500 text-sm">{errors.phone_no}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block font-medium">Email address:</label>
            <input
              type="email"
              name="email"
              className={`w-full p-2 border rounded ${
                errors.email ? "border-red-500" : ""
              }`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block font-medium">Message:</label>
            <textarea
              name="message"
              className={`w-full p-2 border rounded h-28 ${
                errors.message ? "border-red-500" : ""
              }`}
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            {errors.message && (
              <p className="text-red-500 text-sm">{errors.message}</p>
            )}
          </div>

          {/* ✅ Submit Button with Loading State */}
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={`px-5 py-2 rounded text-white flex items-center justify-center gap-2 transition-all
              ${
                isFormValid() && !isSubmitting
                  ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </>
  );
}
