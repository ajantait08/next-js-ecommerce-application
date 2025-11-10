"use client";

import { useCartContext } from "@/context/CartContext";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";

export default function SlideCart() {
  const {
    cartItems,
    isOpen,
    toggleCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    coupon,
    discountRate,
    applyCoupon,
    removeCoupon,
    applied,
    couponError,
    addToCart,
    setCouponError
  } = useCartContext();

  const { products } = useAppContext();
  const cartArray = Array.isArray(cartItems) ? cartItems : [];
  const [couponInput, setCouponInput] = useState("");
  const swiperRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const [touched, setTouched] = useState(false);

  // ✅ Sync couponInput with fetched coupon when context updates
  useEffect(() => {
    if (coupon) {
      setCouponInput(coupon);
    } else {
      setCouponInput("");
      setCouponError("");
    }
  }, [coupon]);

  useEffect(() => {
    if (pathname?.includes("/checkout") && isOpen) {
      toggleCart(false);
      setTouched(false);
    }
  }, [pathname]);

  // ✅ Calculate subtotal and discount
  const subtotal = cartArray.reduce(
    (acc, item) => acc + parseFloat(item.price || 0) * item.quantity,
    0
  );
  const totalDiscount = subtotal * discountRate;
  const total = subtotal - totalDiscount;

  // ✅ Ensure swiper updates only when open
  useEffect(() => {
    if (isOpen && swiperRef.current) {
      try {
        swiperRef.current.update();
      } catch (err) {
        console.warn("Swiper update error:", err);
      }
    }
  }, [isOpen, cartArray, products]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => toggleCart(false)}
        />
      )}

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? "0%" : "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-lg z-50 flex flex-col"
      >
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={() => toggleCart(false)}>✕</button>
        </div>

        {/* CART CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {cartArray.length === 0 ? (
            <p className="text-gray-500">Your cart is empty</p>
          ) : (
            cartArray.map((item, index) => {
              const originalPrice = parseFloat(item.price);
              const discountedPrice = discountRate
                ? originalPrice * (1 - discountRate)
                : originalPrice;

              return (
                <div
                  key={item.id || index}
                  className="flex items-center justify-between mb-3 border-b pb-3"
                >
                  <div className="flex items-center space-x-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded" />
                    )}
                    <span className="font-medium w-36">{item.name}</span>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      {discountRate > 0 ? (
                        <>
                          <span className="line-through text-red-500 mr-2">
                            ₹{(originalPrice * item.quantity).toFixed(2)}
                          </span>
                          <span className="font-bold">
                            ₹{(discountedPrice * item.quantity).toFixed(2)}
                          </span>
                          <p className="text-green-600 text-sm">
                            Save {(discountRate * 100).toFixed(0)}%
                          </p>
                        </>
                      ) : (
                        <span className="font-semibold">
                          ₹{(originalPrice * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => decrementQuantity(item.product_id)}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => incrementQuantity(item.product_id)}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* FEATURED PRODUCTS */}
          {isOpen && products.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Featured Products</h3>

              <Swiper
                onSwiper={(s) => (swiperRef.current = s)}
                direction="horizontal"
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 1800,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={false}
                spaceBetween={12}
                slidesPerView={2}
                observer={true}
                observeParents={true}
                modules={[Autoplay, Navigation, Pagination]}
                className="!w-full py-6"
                breakpoints={{
                  320: { slidesPerView: 1.2 },
                  640: { slidesPerView: 2 },
                }}
              >
                {products
                  .filter((p) => !cartArray.some((c) => c.product_id === p._id))
                  .map((product) => (
                    <SwiperSlide key={product._id}>
                      <div className="border rounded-lg p-3 flex flex-col items-center shadow-sm bg-white">
                        {product.image?.[0] ? (
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded mb-2" />
                        )}

                        <p className="text-sm font-medium text-center truncate">
                          {product.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          ₹{product.price}
                        </p>

                        <button
                          onClick={() => addToCart(product._id)}
                          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Add To Cart
                        </button>
                      </div>
                    </SwiperSlide>
                  ))}
              </Swiper>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value)
              }}             
              className="flex-1 border px-3 py-2 rounded disabled:bg-gray-100 disabled:text-gray-500"
              disabled={applied}
            />
            {discountRate > 0 ? (
              <button
                onClick={removeCoupon}
                className="bg-red-500 text-white px-4 rounded"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={() =>{ 
                  setTouched(true);
                  applyCoupon(couponInput)}}
                className="bg-gray-800 text-white px-4 rounded"
              >
                Apply
              </button>
            )}
          </div>

          {discountRate > 0 && (
            <p className="text-green-600 text-sm">
              Coupon{" "}
              <span className="font-semibold">{coupon.toUpperCase()}</span>{" "}
              Applied!
            </p>
          )}

          {touched && couponError && (
            <p className="text-red-600 text-sm">{couponError}</p>
          )}

          <div className="flex justify-between font-medium">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {discountRate > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Discount:</span>
              <span>- ₹{totalDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <button
            className={`w-full py-2 rounded-lg mt-3 ${
              cartArray.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            onClick={() => {
              if (cartArray.length > 0) {
                router.push("/checkout");
              }
            }}
            disabled={cartArray.length === 0}
          >
            Checkout
          </button>
        </div>
      </motion.div>
    </>
  );
}
