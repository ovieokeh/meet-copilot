import { ActionFunctionArgs } from "@remix-run/node";
import { PaymentOrder } from "~/types";

import { createResponse } from "~/utils";

const PAYPAL_ACCESS_TOKEN = process.env.PAYPAL_ACCESS_TOKEN;

type PaymentRequest = {
  type: "create";
  payload: PaymentOrder & { origin: string };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const paymentRequest: PaymentRequest = await request.json();

  console.log({
    PAYPAL_ACCESS_TOKEN,
  });

  const paymentResponse = await fetch(
    "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    {
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
    },
  )
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return null;
    });

  return createResponse(paymentResponse);
};
