export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { amount } = req.body;

    const response = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amount,
        currency: "ZAR",
        description: "Vireo Jobs - Priority Profile Boost",

        successUrl: "https://vireo-jobs.vercel.app/success.html",
        cancelUrl: "https://vireo-jobs.vercel.app/cancel.html",

        metadata: {
          website: "Vireo Jobs",
          product: "Priority Profile Boost",
        },
      }),
    });

    const data = await response.json();

    // Log the response for debugging
    console.log("Yoco Response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data,
      });
    }

    // Handle different possible response formats
    const redirectUrl =
      data.redirectUrl ||
      data.redirect_url ||
      data.url ||
      data.checkoutUrl ||
      data.checkout_url ||
      null;

    if (!redirectUrl) {
      return res.status(500).json({
        error: "No checkout URL returned from Yoco.",
        response: data,
      });
    }

    return res.status(200).json({
      redirectUrl,
    });
  } catch (error) {
    console.error("Checkout Error:", error);

    return res.status(500).json({
      error: "Something went wrong while creating the checkout session.",
    });
  }
}