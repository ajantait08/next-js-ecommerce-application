"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";
import { useCartContext } from "@/context/CartContext";
import Loading from "@/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { useParams } from "next/navigation";

const CollectionPage = () => {
  const { products } = useAppContext();
  const { addToCart } = useCartContext();

  const { category } = useParams();

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(category || "All");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract distinct categories
  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueCategories = [
        "All",
        ...Array.from(
          new Set(products.map((product) => product.category).filter(Boolean))
        ),
      ];
      setCategories(uniqueCategories);
      setFilteredProducts(products);
      setLoading(false);
    }
  }, [products]);

  // Filter products when tab changes
  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.category?.toLowerCase() === activeCategory.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  }, [activeCategory, products]);

  if (loading) return <Loading />;

  return (
    <>
      <Navbar />

      <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
        {/* Header */}
        <div className="flex flex-col pt-12 w-full">
          <p className="text-2xl font-medium">Product Collections</p>
          <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mt-8 border-b pb-3 w-full">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm md:text-base transition-all duration-200 
                ${
                  activeCategory === category
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Animated Product Grid */}
        <div className="relative w-full min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory} // important for triggering animation on tab change
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-10 pb-14 w-full"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <ProductCard
                    key={index}
                    product={product}
                    addToCart={addToCart}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 text-lg">
                  No products found in this category.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CollectionPage;
