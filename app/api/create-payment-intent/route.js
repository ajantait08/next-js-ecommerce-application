import { NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentMethodDomain = await stripe.paymentMethodDomains.create({
    domain_name: 'b20943c47c78.ngrok-free.app',
  });

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, billing } = body;

    if (!amount || !billing) {
      return NextResponse.json(
        { error: "Missing required fields: amount or billing" },
        { status: 400 }
      );
    }

    // Extract and sanitize billing info
    const {
      email,
      phone,
      firstName,
      lastName,
      country,
      street,
      apartment,
      city,
      state,
      notes,
    } = billing;

    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        name: fullName,
        email,
        phone,
        address: {
          line1: street || "",
          line2: apartment || "",
          city: city || "",
          state: state || "",
          country: country || "",
        },
        shipping: {
          name: fullName,
          address: {
            line1: street || "",
            line2: apartment || "",
            city: city || "",
            state: state || "",
            country: country || "",
          },
        },
        metadata: {
          order_notes: notes || "",
        },
      });
    }

    // 🧾 Step 2: Create Payment Intent for that Customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount already in subunits (cents/paise)
      currency: "usd",
      customer: customer.id,
      description: "Order Payment",
      metadata: {
        customer_id: customer.id,
        customer_name: fullName || "N/A",
        customer_email: email || "N/A",
        customer_phone: phone || "N/A",
        customer_country: country || "N/A",
        customer_street: street || "N/A",
        customer_apartment: apartment || "",
        customer_city: city || "N/A",
        customer_state: state || "N/A",
        order_notes: notes || "",
      },
      shipping: {
        name: fullName || "N/A",
        address: {
          line1: street || "",
          line2: apartment || "",
          city: city || "",
          state: state || "",
          country: country || "",
        },
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // ✅ Step 3: Return client secret
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
