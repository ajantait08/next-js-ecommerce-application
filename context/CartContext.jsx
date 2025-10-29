"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const CartContext = createContext();

export const useCartContext = () => useContext(CartContext);

export function CartContextProvider(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [user, setUser] = useState(null);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchCart(storedUser.id);
      fetchTemporaryCoupon(storedUser.id);
    }
    if (pathname === "/checkout") setIsOpen(false);
  }, [pathname]);

  const fetchCart = async (userId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/cart/${userId}`);
      const data = await res.json();
      const itemsArray = Array.isArray(data.items) ? data.items : [];
      setCartItems(itemsArray);
      const subtotal = itemsArray.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setSubTotal(subtotal);
    } catch {
      setCartItems([]);
      setSubTotal(0);
    }
  };

  const fetchTemporaryCoupon = async (userId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/temporary-coupon/${userId}`
      );
      const data = await res.json();
      if (data?.temporary_coupons?.[0]?.coupon_code) {
        setCoupon(data.temporary_coupons[0].coupon_code);
        setDiscountRate(data.temporary_coupons[0].discount_rate || 0);
        setApplied(true);
      }
    } catch (err) {
      console.error("Error fetching temporary coupon:", err);
    }
  };

  const toggleCart = () => setIsOpen((prev) => !prev);

  // ✅ Apply/remove coupon logic remains same
  const applyCoupon = async (code) => {
    if (!code) return;
    const res = await fetch("http://127.0.0.1:8000/api/apply-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        subTotal,
        user_id: user?.id,
        user_email: user?.email,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setDiscountRate(data.discount_rate);
      setCoupon(code);
      setApplied(true);
    }
  };

  const removeCoupon = async () => {
    if (!coupon) return;
    const res = await fetch("http://127.0.0.1:8000/api/remove-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, user_id: user?.id }),
    });
    if (res.ok) {
      setDiscountRate(0);
      setCoupon("");
      setApplied(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isOpen,
        toggleCart,
        coupon,
        discountRate,
        applied,
        applyCoupon,
        removeCoupon,
        setCoupon
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
}
