"use client";

import { useCartContext } from "@/context/CartContext";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import HideErrorText from "@/components/HideErrorText";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect, useMemo } from "react";
import CouponBox from "@/components/CouponBox"; // ✅ dynamic coupon dropdown component

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined!");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function CheckoutPage() {
  const {
    cartItems,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    coupon
  } = useCartContext();
  const { products } = useAppContext();

  const cartArray = Array.isArray(cartItems) ? cartItems : [];
  const [shipping, setShipping] = useState("free");
  const [clientSecret, setClientSecret] = useState("");
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    country: "India",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // ---- Calculate subtotal ----
  const subtotal = useMemo(() => {
    return cartArray.reduce((acc, item) => {
      const product = products.find((p) => p._id === item.product_id);
      return acc + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cartArray, products]);

  // ---- Shipping ----
  const shippingCost = shipping === "expedited" ? 199 : 0;

  // ---- Update final total whenever subtotal/discount/shipping changes ----
  useEffect(() => {
    const total = Math.max(subtotal - discount + shippingCost, 0);
    setFinalTotal(total);
  }, [subtotal, discount, shippingCost]);

  // ---- Validation ----
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
        break;
      case "phone":
        if (!value) return "Phone number is required";
        if (!/^\d{10}$/.test(value)) return "Invalid phone number";
        break;
      case "firstName":
        if (!value) return "First name is required";
        break;
      case "lastName":
        if (!value) return "Last name is required";
        break;
      case "country":
        if (!value) return "Country is required";
        break;
      case "street":
        if (!value) return "Street address is required";
        break;
      case "city":
        if (!value) return "City is required";
        break;
      case "state":
        if (!value) return "State is required";
        break;
      case "pincode":
        if(!value) return "Pincode is required";
        if(!/^\d{6}$/.test(value)) return "Pincode must be 6 digits";
        break;
      default:
        break;
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return newErrors;
  };

  const isFormValid = useMemo(() => {
    const errs = validate();
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    const fieldError = validateField(name, value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (fieldError) newErrors[name] = fieldError;
      else delete newErrors[name];
      return newErrors;
    });
  };

  // ---- Create Stripe Payment Intent ----
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!isFormValid) return;
      setIsCreatingIntent(true);

      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(finalTotal * 100),
            billing: form,           
          }),
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Error creating payment intent:", err);
      } finally {
        setIsCreatingIntent(false);
      }
    };

    createPaymentIntent();
  }, [finalTotal, form, isFormValid]);

  const isCartEmpty = Object.keys(cartItems).length === 0;

  return (
    <>
    <HideErrorText />
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Billing Form */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4" noValidate>
          <h2 className="text-xl font-bold mb-4">Billing details</h2>

          {/* Email */}
          <div>
            <label className="block font-medium">Email address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium">Phone no. *</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">First name *</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block font-medium">Last name *</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block font-medium">Country / Region *</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select country</option>
              <option value="India">India</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="Canada">Canada</option>
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm">{errors.country}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block font-medium">Street address *</label>
            <input
              type="text"
              name="street"
              value={form.street}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="House number and street name"
            />
            <input
              type="text"
              name="apartment"
              value={form.apartment}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Apartment, suite, unit, etc. (optional)"
            />
            {errors.street && (
              <p className="text-red-500 text-sm">{errors.street}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block font-medium">Town / City *</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
          </div>

          {/* State */}
          <div>
            <label className="block font-medium">State *</label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
          </div>
          {/* Pincode */}
          <div>
            <label className="block font-medium">Pincode *</label>
            <input
              type="text"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}
          </div>
        </form>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg shadow space-y-3">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>

          <div className="divide-y">
            {cartArray.map((item) => {
              const product = products.find((p) => p._id === item.product_id);
              if (!product) return null;
              return (
                <div key={item.id} className="flex justify-between py-2">
                  <span>{product.name} × {item.quantity}</span>
                  <span>₹{(product.price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          {/* ✅ Coupon Dropdown */}
          <CouponBox
            subtotal={subtotal}
            setDiscount={setDiscount}
            setFinalTotal={setFinalTotal}
          />

          {/* Price Summary */}
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>- ₹{discount.toFixed(2)}</span>
            </div>
          )}

          {/* Shipping */}
          <div className="space-y-2">
            <p className="font-medium">Shipping:</p>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="free"
                checked={shipping === "free"}
                onChange={(e) => setShipping(e.target.value)}
              />
              <span>Free Shipping (₹0)</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="expedited"
                checked={shipping === "expedited"}
                onChange={(e) => setShipping(e.target.value)}
              />
              <span>Expedited Shipping (₹199)</span>
            </label>
          </div>

          <div className="flex justify-between">
            <span>Shipping Cost:</span>
            <span>{shippingCost > 0 ? `₹${shippingCost}` : "₹0"}</span>
          </div>

          <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
            <span>Total:</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCheckoutForm
                clientSecret={clientSecret}
                amount={finalTotal}
                isFormValid={isFormValid}
                form={form}
                cartArray={cartArray}
                shippingCost={shippingCost}
                appliedCoupon={coupon}
              />
            </Elements>
          )}
        </div>
      </div>
    </>
  );
}

/** Stripe Checkout Form **/
function StripeCheckoutForm({ clientSecret, amount, isFormValid , form , cartArray, shippingCost , appliedCoupon }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPaymentElementComplete, setIsPaymentElementComplete] = useState(false);

  const handleChange = (event) => {
    setIsPaymentElementComplete(event.complete);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !isFormValid || !isPaymentElementComplete) {
      setErrorMessage("Please fill all details and card info correctly.");
      setLoading(false);
      return;
    }

    // Save order to backend before confirming payment
    
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const encoded = Buffer.from(clientSecret).toString("base64");
      const res = await fetch("http://127.0.0.1:8000/api/save-order-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form,
          cart_items: cartArray,
          total_amount: amount,
          shipping_cost: shippingCost,
          payment_intent_id: '',
          payment_status : '',
          applied_coupon : appliedCoupon,
          user_id: storedUser ? storedUser.id : null,
          user_email: storedUser ? storedUser.email : null,
        }),
      });
      const data = await res.json();
      localStorage.setItem("user_info_id", data.user_info_id);
    } catch (err) {
      console.error("Error saving order:", err);
    }

    // Save order to backend before confirming payment

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error , paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      //redirect: "if_required"
      confirmParams: {
        return_url: `http://localhost:3000/payment-success?amount=${amount}&user_info_id=${Buffer.from(localStorage.getItem("user_info_id")).toString("base64")}`,
      },
    });

    if (error) setErrorMessage(error.message);
    setLoading(false);

      // Redirect to success page
      //window.location.href = `/payment-success?amount=${amount}`;
    //}
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <PaymentElement onChange={handleChange} />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <button
        type="submit"
        disabled={!stripe || !isFormValid || !isPaymentElementComplete || loading}
        className={`w-full py-2 rounded-lg font-semibold ${
          !stripe || !isFormValid || !isPaymentElementComplete
            ? "bg-gray-400 cursor-not-allowed text-gray-200"
            : "bg-green-600 text-white"
        }`}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
