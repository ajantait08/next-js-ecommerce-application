import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { CartContextProvider } from "@/context/CartContext";
import { AuthContextProvider } from "@/context/AuthContext";

import { Toaster } from "react-hot-toast";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "QuickCart - GreatStack",
  description: "E-Commerce with Next.js ",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <body className={`${outfit.className} antialiased text-gray-700`} >
          <Toaster />
          <AuthContextProvider>
          <AppContextProvider>
            <CartContextProvider>
            {children}
            </CartContextProvider>
          </AppContextProvider>
          </AuthContextProvider>
        </body>
      </html>
  );
}
