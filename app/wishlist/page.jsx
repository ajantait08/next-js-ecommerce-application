"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import {assets} from "@/assets/assets";
import Image from "next/image";

const WishlistPage = () => {
  const { wishlist, router, toggleWishlist } = useAppContext();

  // const user = JSON.parse(localStorage.getItem("user"));
  //     if (!user?.id) {
  //       router.push("/auth/login");
  //       return;
  //     }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 w-full px-6 md:px-10 lg:px-20 py-10">
        <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Image
              src={assets.empty_wishlist_image}
              alt="empty wishlist"
              width={450}
              height={450}
              className="mb-6 opacity-80"
            />
            {/* <p className="text-gray-500 mb-4">Your wishlist is empty.</p> */}
            <button
              onClick={() => router.push("/all-products")}
              className="px-5 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="relative">
                <ProductCard product={product} />

                {/* Remove from wishlist button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className="absolute top-3 left-3 bg-white/90 hover:bg-red-100 p-1.5 rounded-full shadow-md transition"
                >
                  <Image
                    src={assets.delete_wishlist}
                    alt="remove from wishlist"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default WishlistPage;
