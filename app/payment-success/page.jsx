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

  const [shippingCost, setShippingCost] = useState(0);
  const [couponDetails, setCouponDetails] = useState({});
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  const searchParams = useSearchParams();

  useEffect(() => {
    const amount = searchParams.get("amount");
    const payment_intent = searchParams.get("payment_intent");
    const redirect_status = searchParams.get("redirect_status");
    const user_info_id = searchParams.get("user_info_id");

    setPaymentDetails({ amount, payment_intent, redirect_status });

    if (payment_intent && redirect_status === "succeeded") {
      fetchOrderAndUserDetails(payment_intent, amount, user_info_id);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderAndUserDetails = async (paymentIntent, amount, user_info_id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/update-order-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, payment_intent: paymentIntent, user_info_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();

      setOrderItems(data.order_details || []);
      setUserInfo(data.user_info || {});
      setShippingCost(data.shipping_cost || 0);
      //setCouponDetails(data.coupon_details || {});
      setDiscountAmount(data.discount_amount || 0);
      setCouponCode(data.coupon_code || '');
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const finalTotal = subtotal + Number(shippingCost) - Number(discountAmount);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading your order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-lg w-full">
        {paymentDetails.redirect_status === "succeeded" ? (
          <>
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-green-500 w-16 h-16 mb-4" />
              <h1 className="text-2xl font-semibold mb-2 text-gray-800">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-4">
                Thank you, {userInfo.first_name} {userInfo.last_name}. Your
                payment has been processed successfully.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 text-left text-gray-700">
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

              {/* Shipping Info */}
              <div className="mt-5">
                <h3 className="font-semibold mb-2 text-lg">Shipping Info</h3>
                <p>{userInfo.address}</p>
                <p>
                  {userInfo.city}, {userInfo.state} - {userInfo.pincode}
                </p>
                <p>{userInfo.country}</p>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-lg">Order Details</h3>
                {orderItems.length > 0 ? (
                  orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-gray-100 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-md border"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-700">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">₹{item.price} each</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No order items found.</p>
                )}
              </div>

              {/* Amount Breakdown */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3 text-lg">Amount Breakdown</h3>
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 mt-1">
                  <span>Shipping</span>
                  <span>₹{Number(shippingCost).toFixed(2)}</span>
                </div>

                {couponCode && (
                  <div className="flex justify-between text-green-700 mt-1">
                    <span>
                      Coupon ({couponCode})
                    </span>
                    <span>- ₹{Number(discountAmount).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-gray-900 mt-3 border-t border-gray-200 pt-2">
                  <span>Final Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
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
            <h1 className="text-xl font-semibold text-red-500 mb-3 text-center">
              Payment Not Completed
            </h1>
            <p className="text-gray-600 mb-4 text-center">
              It seems your payment was not successful or was cancelled.
            </p>
            <div className="text-center">
              <Link
                href="/checkout"
                className="inline-block bg-red-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition"
              >
                Try Again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
