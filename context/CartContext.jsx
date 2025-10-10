// context/CartContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCartContext = () => {
    return useContext(CartContext)
}

export function CartContextProvider(props) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [subTotal , setSubTotal] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [discountRate, setDiscountRate] = useState(0);

  const addToCart = (itemId) => {
    
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
        cartData[itemId] += 1;
    }
    else {
        cartData[itemId] = 1;
    }
    setCartItems(cartData);
    setIsOpen(true); // open cart when adding

  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      console.log(updated);
      delete updated[id];
      return updated;
    });
  };

  const incrementQuantity = (id) => {
    setCartItems((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrementQuantity = (id) => {
    setCartItems((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return {
        ...prev,
        [id]: current - 1,
      };
    });
  };

  const toggleCart = () => setIsOpen((prev) => !prev);
  // ✅ Coupon logic
  const applyCoupon = (code) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === "SAVE10") {
      setDiscountRate(0.1);
      setCoupon(formatted);
    } else if (formatted === "SAVE20") {
      setDiscountRate(0.2);
      setCoupon(formatted);
    } else if (formatted === "SAVE50") {
      setDiscountRate(0.5);
      setCoupon(formatted);
    } else {
      setDiscountRate(0);
      setCoupon("");
      alert("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setCoupon("");
    setDiscountRate(0);
  };

  return (
    <CartContext.Provider
      value={{items, addToCart, cartItems , removeFromCart,incrementQuantity,decrementQuantity, isOpen, toggleCart ,coupon,
        discountRate,
        applyCoupon,
        removeCoupon}}
    >
      {props.children}
    </CartContext.Provider>
  );
}
