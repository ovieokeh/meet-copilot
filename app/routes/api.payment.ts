import { ActionFunctionArgs } from "@remix-run/node";
import { PaymentOrder } from "~/types";
import { config } from "dotenv";

config();

import { createResponse } from "~/utils";
import { createSBServerClient } from "~/models/supabase.server";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const base = "https://api-m.sandbox.paypal.com";

type PaymentRequest = {
  type: "create";
  payload: PaymentOrder & { origin: string };
};

async function handleResponse(response: Response) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
    ).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = (await handleResponse(response)).jsonResponse;
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const headers = new Headers();
  const supabaseClient = createSBServerClient(request, headers);

  const user = await supabaseClient.auth.getUser();
  if (!user.data.user?.email) {
    return createResponse({ error: "UNAUTHORIZED" }, 401);
  }

  const paymentRequest: PaymentRequest = await request.json();

  const PAYPAL_ACCESS_TOKEN = await generateAccessToken();
  const paymentResponse = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PAYPAL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: paymentRequest.payload.price,
          },
          reference_id: paymentRequest.payload.id,
        },
      ],
      experience_context: {
        payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
        payment_method_selected: "PAYPAL",
        brand_name: "Meet Copilot",
        locale: "en-US",
        user_action: "PAY_NOW",
        return_url: `${paymentRequest.payload.origin}/successUrl`, // e.g. `https://example.com/successUrl
        cancel_url: `${paymentRequest.payload.origin}/cancelUrl`, // e.g. `https://example.com/cancelUrl
      },
    }),
  });
  // .then((response) => {
  //   if (!response.ok) {
  //     response.text().then((text) => {
  //       console.error("Failed to create payment order:", text);
  //     });
  //     throw new Error("Failed to create payment order");
  //   }
  //   return response.json();
  // })
  // .catch((error) => {
  //   // console.error(error)
  //   console.error("Failed to create payment order:", error.message);
  //   return null;
  // });

  const data = await handleResponse(paymentResponse);
  if (data.httpStatusCode !== 201) {
    return createResponse(data.jsonResponse, data.httpStatusCode);
  }

  await supabaseClient
    .from("UserOrders")
    .upsert({
      user_email: user.data.user.email,
      order_id: data.jsonResponse.id,
      product: paymentRequest.payload.title,
    })
    .single()
    .then((response) => {
      if (response.error) {
        console.error(
          "Failed to save order:",
          user.data.user?.email,
          data.jsonResponse.id,
          response.error,
        );
      }
    });

  return createResponse(data.jsonResponse);
};
