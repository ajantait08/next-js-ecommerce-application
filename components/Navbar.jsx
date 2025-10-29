"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useCartContext } from "@/context/CartContext";
import Image from "next/image";
import SlideCart from "@/components/SlideCart";

const Navbar = () => {
  const { isSeller, router } = useAppContext();
  const { toggleCart, cartItems } = useCartContext();
  const cartArray = Object.entries(cartItems);

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage on mount
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const handleWishlistLink = (e) => {
    if (!user?.id) {
      e.preventDefault();
      router.push("/auth/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("wishlist");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      {/* Logo */}
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="logo"
      />

      {/* Links */}
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link
          href="/wishlist"
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistLink(e);
          }}
          className="hover:text-gray-900 transition"
        >
          Wishlist
        </Link>
        <Link href="/about" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href="/contact" className="hover:text-gray-900 transition">
          Contact
        </Link>

        {/* Cart Icon */}
        <button onClick={toggleCart} className="relative text-xl">
          🛒
          {cartArray.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cartArray.length}
            </span>
          )}
        </button>

        <SlideCart />

        {/* Seller Dashboard */}
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Seller Dashboard
          </button>
        )}

        {/* User Authentication Section */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border px-3 py-1 rounded-full cursor-pointer hover:bg-gray-100 transition"
            style={{"backgroundColor": "orange"}}>
              <Image
                src={user.avatar || assets.user_icon}
                alt="user"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm font-medium">{user.name || "User"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs border border-gray-400 px-3 py-1.5 rounded-full hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/auth/login")}
            className="text-xs border border-gray-400 px-4 py-1.5 rounded-full hover:bg-gray-100"
          >
            Login / Register
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
