'use client';
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter , usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
//import { useLocation } from 'react-router-dom';

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = (props) => {

  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [userId, setUserId] = useState(1);

  //const location = useLocation();

  
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id && pathname === "/checkout") {
          router.push("/auth/login");
          return;
        }
        else if (!user?.id) {
          return
        }
        else {
          setUserId(user.id);
        }
        const res = await fetch(`http://127.0.0.1:8000/api/wishlist/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        const data = await res.json();
        setWishlist(data.wishlist || []);
        localStorage.setItem("wishlist", JSON.stringify(data.wishlist || []));
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        const stored = localStorage.getItem("wishlist");
        if (stored) setWishlist(JSON.parse(stored));
      }
    };
    fetchWishlist();
  }, [pathname]);

  
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ✅ Toggle wishlist (add/remove)
  const toggleWishlist = async (product) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        router.push("/auth/login");
        return;
      }

      const alreadyWishlisted = wishlist.find((item) => item._id === product._id);

      const payload = {
        _id: product._id,
        name: product.name,
        user_id: user.id,
        user_email: user.email,
        action: alreadyWishlisted ? "remove" : "add",
      };

      const res = await fetch("http://127.0.0.1:8000/api/storeWishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update wishlist");

      // Update state only after success
      setWishlist((prev) =>
        alreadyWishlisted
          ? prev.filter((item) => item._id !== product._id)
          : [...prev, product]
      );
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  // ✅ Sync between multiple tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "wishlist") {
        const updated = JSON.parse(event.newValue || "[]");
        setWishlist(updated);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Dummy product/user fetch
  const fetchProductData = async () => setProducts(productsDummyData);
  const fetchUserData = async () => setUserData(userDummyData);

  // ✅ Cart management
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const updateCartQuantity = (itemId, quantity) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (quantity === 0) delete newCart[itemId];
      else newCart[itemId] = quantity;
      return newCart;
    });
  };

  const getCartCount = () =>
    Object.values(cartItems).reduce((a, b) => a + b, 0);

  const getCartAmount = () => {
    return Math.floor(
      Object.entries(cartItems).reduce((sum, [id, qty]) => {
        const item = products.find((p) => p._id === id);
        return item ? sum + item.offerPrice * qty : sum;
      }, 0) * 100
    ) / 100;
  };

  useEffect(() => {
    fetchProductData();
    fetchUserData();
  }, []);

  const value = {
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    wishlist,
    toggleWishlist,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
