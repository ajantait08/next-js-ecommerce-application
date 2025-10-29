"use client";
import { useEffect } from "react";
import { useCartContext } from "@/context/CartContext";

export default function CouponBox({ subtotal, setDiscount, setFinalTotal }) {
  const {
    coupon,
    discountRate,
    applyCoupon,
    removeCoupon,
    applied,
    setCoupon,
    message,
    loading,
  } = useCartContext();

  // ✅ Automatically update discount and total on coupon or subtotal change
  useEffect(() => {
    const discountAmount = (subtotal * discountRate);
    setDiscount(discountAmount);
    setFinalTotal(subtotal - discountAmount);
  }, [subtotal, discountRate]);

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          disabled={applied || loading}
          className="border rounded p-2 flex-1 disabled:bg-gray-100 disabled:text-gray-500"
        />

        {!applied ? (
          <button
            onClick={() => applyCoupon(coupon)}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Applying..." : "Apply"}
          </button>
        ) : (
          <button
            onClick={removeCoupon}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Removing..." : "Remove"}
          </button>
        )}
      </div>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
