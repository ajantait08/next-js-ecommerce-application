'use client'

import CheckoutPage from "../checkout/page";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";


if(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined){
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined !");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);



export default function Home(){
    const amount = 49.99;
    return (
    // <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-blue-500 to-purple-500">
        <Elements
            stripe={stripePromise}
            options={{                
                    mode: "payment",
                    amount: convertToSubcurrency(amount), //cents
                    currency: "usd",              
            }}
        >
        </Elements>
    // </main>
    )
}