"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter,usePathname } from "next/navigation";

const CartContext = createContext();

export const useCartContext = () => useContext(CartContext);

export function CartContextProvider(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [couponError , setCouponError] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [tempSessionData, setTempSessionData] = useState(null);
  const [lastAppliedCoupon, setLastAppliedCoupon] = useState(null);
  const [user, setUser] = useState(null);
  const [applied, setApplied] = useState(false);
  const [appliedBuyNow, setAppliedBuyNow] = useState(false);
  const [message, setMessage] = useState("");
  const [isBuyNowActive, setIsBuyNowActive] = useState(false);
  const [loadingTempSession, setLoadingTempSession] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchCart(storedUser.id);
      fetchTemporaryCoupon(storedUser.id);
      setCouponError("");
    }
    if (pathname === "/checkout") setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const verifyTempSession = async () => {
      if (pathname !== "/checkout") {
      try {
        // Call API to deactivate all active temp sessions
        const res = await fetch("http://127.0.0.1:8000/api/make_all_temp_session_inactive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
  
        const data = await res.json();
        console.log("Deactivate all temp sessions response:", data);
  
        // Handle based on backend response
        if (data?.success) {
          // All sessions successfully deactivated
          setTempSessionData(null);
          setIsBuyNowActive(false);
        } else {
          console.warn("Failed to deactivate sessions:", data);
        }
  
        // Optionally: If you're on checkout, re-verify session or keep logic separate
        if (pathname.includes("/checkout")) {
          setIsBuyNowActive(true);
        } else {
          setIsBuyNowActive(false);
        }
  
      } catch (error) {
        console.error("Error verifying temp sessions:", error);
        setTempSessionData(null);
        setIsBuyNowActive(false);
      }
    }
    };
  
    verifyTempSession();
  }, [pathname]);

  // ✅ Fetch full cart for Add to Cart logic
  const fetchCart = async (userId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/cart/${userId}`);
      const data = await res.json();
      const itemsArray = Array.isArray(data.items) ? data.items : [];
      const subtotal = itemsArray.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setCartItems(itemsArray);
      setSubTotal(subtotal);
      return { itemsArray, subtotal }; // ✅ Return values for instant use
    } catch {
      setCartItems([]);
      setSubTotal(0);
      return { itemsArray: [], subtotal: 0 };
    }
  };

  // ✅ Fetch temp checkout session data for Buy Now
  const fetchTempSessionData = async (sessionIdValue = sessionId) => {
    if (!sessionIdValue) return null;
    setLoadingTempSession(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/checkout-session/${sessionIdValue}`
      );
      const data = await res.json();
      if (data.success) {
        setTempSessionData(data);
        return data; // ✅ Return fetched data
      }
    } catch (err) {
      console.error("Error fetching temp session data:", err);
    }
    finally {
      setLoadingTempSession(false); // stop loader
    }
    return null;
  };

  // ✅ When sessionId changes, fetch temporary checkout data
  useEffect(() => {
    fetchTempSessionData();
  }, [sessionId]);


  // ✅ Add item to cart
  const addToCart = async (product, buynow = false) => {
    setSessionId(null);
    console.log('product details',product);
    if (!user) return alert("Please login first!");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/make_all_temp_session_inactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      const data = await res.json();
      console.log("Cart response:", data);
      fetchTempSessionData();
      try{
      const res = await fetch("http://127.0.0.1:8000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: product,
          // name: product.name,
          // description: product.description || "",
          // price: product.price,
          // quantity: 1,
          // image: product.image || "",
        }),
      });

      // Refresh cart
      await fetchCart(user.id);

      if (lastAppliedCoupon && !applied) {
        await applyCoupon(lastAppliedCoupon);
      }

      setIsBuyNowActive(false);

      // Toggle cart visibility
      setIsOpen(!buynow);
      }
      catch(err){
        console.error("Error adding to cart:", err);
      }
    } catch (err) {
      console.error("Unable to make all temp session as inactive", err);
      
    }
  };

  // ✅ Remove item from cart
  const removeFromCart = async (productId) => {
    if (!user) return;

    try {
      await fetch(`http://127.0.0.1:8000/api/cart/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
        }),
      });

      await fetchCart(user.id);
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  // ✅ Increment item quantity
  const incrementQuantity = async (productId) => {
    const item = cartItems.find((i) => i.product_id === productId);
    if (!item) return;

    try {
      await fetch("http://127.0.0.1:8000/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          quantity: item.quantity + 1,
        }),
      });

      await fetchCart(user.id);
    } catch (err) {
      console.error("Error incrementing quantity:", err);
    }
  };

  const incrementBuyNowQuantity = async () => {
    if (!tempSessionData?.data?.session_id) return;
  
    try {
      const newQty = (tempSessionData.data.quantity || 1) + 1;
  
      const res = await fetch("http://127.0.0.1:8000/api/temp_sessions_item/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: tempSessionData.data.session_id,
          quantity: newQty,
        }),
      });
  
      const result = await res.json();
      console.log("Increment Buy Now result:", result);
      if (result.status) {
        console.log("Increment Buy Now result:", result);
        await fetchTempSessionData(tempSessionData.data.session_id);
      }
    } catch (err) {
      console.error("Error incrementing Buy Now quantity:", err);
    }
  };
  
  const decrementBuyNowQuantity = async () => {
    if (!tempSessionData?.data?.session_id) return;
  
    try {
      const newQty = Math.max(1, (tempSessionData.data.quantity || 1) - 1);
  
      const res = await fetch("http://127.0.0.1:8000/api/temp_sessions_item/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: tempSessionData.data.session_id,
          quantity: newQty,
        }),
      });
  
      const result = await res.json();
  
      if (result.status) {
        console.log("Decrement Buy Now result:", result);
        await fetchTempSessionData(tempSessionData.data.session_id);
      }
    } catch (err) {
      console.error("Error decrementing Buy Now quantity:", err);
    }
  };
  // ✅ Decrement item quantity
  const decrementQuantity = async (productId) => {
    const item = cartItems.find((i) => i.product_id === productId);
    if (!item) return;

    if (item.quantity <= 1) {
      await removeFromCart(productId);
      return;
    }

    try {
      await fetch("http://127.0.0.1:8000/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          quantity: item.quantity - 1,
        }),
      });

      await fetchCart(user.id);
    } catch (err) {
      console.error("Error decrementing quantity:", err);
    }
  };

  /* Buy Now function can be added here */
  const handleBuyNowContext = async (productId) => {
    //addToCart(productId,true); // Stop the product from being sending to cart.
    if (!user) return alert("Please login first!");

    setIsBuyNowActive(true);

    if (applied && coupon) {
      await removeCoupon();
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/store_temp_checkout_session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          user_email: user.email,
        }),
      });
      const data = await res.json();
      console.log("Temporary checkout response:", data);
      setSessionId(data.session_id);
      // Refresh cart
      //await fetchCart(user.id);
      // Toggle cart visibility
      //setIsOpen(!buynow);
    } catch (err) {
      console.error("Error adding to temporary response:", err);
    }
    //router.push("/checkout");
  };

  /* Buy Now function can be added here */

  const fetchTemporaryCoupon = async (userId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/temporary-coupon/${userId}`
      );
      const data = await res.json();
      if (data.temporary_coupons[0]) {
        setCoupon(data.temporary_coupons[0].coupon_code);
        setDiscountRate(data.temporary_coupons[0].discount_rate || 0);
        setApplied(true);
      }
      else {
        setCoupon("");
        setDiscountRate(0);
        setApplied(false);
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
    console.log("Apply coupon response:", data);
    if (res.ok) {
      setDiscountRate(data.discount_rate);
      setCoupon(code);
      setApplied(true);
      setCouponError('');
      setLastAppliedCoupon(code);
    }
    else {
      setDiscountRate(0);
      setCouponError(data.error || "Failed to apply coupon");
      setApplied(false);
      //setCoupon("");
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

  const verifyTempSessionFromCheckout = async () => {
    if (pathname !== "/checkout") {
    try {
      // Call API to deactivate all active temp sessions
      const res = await fetch("http://127.0.0.1:8000/api/make_all_temp_session_inactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      console.log("Deactivate all temp sessions response:", data);

      // Handle based on backend response
      if (data?.success) {
        // All sessions successfully deactivated
        setTempSessionData(null);
        setIsBuyNowActive(false);
      } else {
        console.warn("Failed to deactivate sessions:", data);
      }

      // Optionally: If you're on checkout, re-verify session or keep logic separate
      if (pathname.includes("/checkout")) {
        setIsBuyNowActive(true);
      } else {
        setIsBuyNowActive(false);
      }

    } catch (error) {
      console.error("Error verifying temp sessions:", error);
      setTempSessionData(null);
      setIsBuyNowActive(false);
    }
  }
  router.push("/");
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
        setCoupon,
        addToCart,
        removeFromCart,
        incrementQuantity,
        incrementBuyNowQuantity,
        decrementQuantity,
        decrementBuyNowQuantity,
        couponError,
        setCouponError,
        user,
        handleBuyNowContext,
        tempSessionData,
        isBuyNowActive,
        loadingTempSession,
        setCartItems,
        setTempSessionData,
        setLoadingTempSession,
        verifyTempSessionFromCheckout
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
}
