"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const [orderItems, setOrderItems] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: "",
    payment_intent: "",
    redirect_status: "",
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const amount = searchParams.get("amount");
    const payment_intent = searchParams.get("payment_intent");
    const redirect_status = searchParams.get("redirect_status");

    setPaymentDetails({ amount, payment_intent, redirect_status });

    if (payment_intent && redirect_status === "succeeded") {
      fetchOrderAndUserDetails(payment_intent, amount);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderAndUserDetails = async (paymentIntent, amount) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/order-details/${paymentIntent}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrderItems(data.order_details || []);
      setUserInfo(data.user_info || {});
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading your order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        {paymentDetails.redirect_status === "succeeded" ? (
          <>
            <CheckCircle2 className="mx-auto text-green-500 w-16 h-16 mb-4" />
            <h1 className="text-2xl font-semibold mb-2 text-gray-800">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you, {userInfo.first_name} {userInfo.last_name}. Your
              payment has been processed successfully.
            </p>

            <div className="border-t border-gray-200 pt-4 text-left text-gray-700">
              <p>
                <span className="font-semibold">Amount Paid:</span> ₹
                {Number(paymentDetails.amount || 0).toFixed(2)}
              </p>
              <p>
                <span className="font-semibold">Payment ID:</span>{" "}
                {paymentDetails.payment_intent}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span className="text-green-600 capitalize">
                  {paymentDetails.redirect_status}
                </span>
              </p>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Shipping Info</h3>
                <p>{userInfo.address}</p>
                <p>
                  {userInfo.city}, {userInfo.state} - {userInfo.pincode}
                </p>
                <p>{userInfo.country}</p>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Order Details</h3>
                {orderItems.length > 0 ? (
                  orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b border-gray-100 py-2"
                    >
                      <span>{item.product_name}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No order items found.</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center bg-green-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition"
              >
                Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-red-500 mb-3">
              Payment Not Completed
            </h1>
            <p className="text-gray-600 mb-4">
              It seems your payment was not successful or was cancelled.
            </p>
            <Link
              href="/checkout"
              className="inline-block bg-red-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition"
            >
              Try Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
