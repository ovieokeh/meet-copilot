import { OnApproveData } from "@paypal/paypal-js";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { FC } from "react";
import { createToast } from "vercel-toast";
import { useSupabase } from "~/contexts/supabase-context";
import { renderStringBasedOnEnv } from "~/lib/utils";
import { PaymentOrder } from "~/types";

const PaymentButtons: FC<{
  order: PaymentOrder;
}> = ({ order }) => {
  const supabase = useSupabase();

  const createOrder = async () => {
    const origin = window.location.origin;
    const orderUrl = `${origin}/api/payment`;

    try {
      const response = await fetch(orderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // use the "body" param to optionally pass additional order information
        // like product ids and quantities
        body: JSON.stringify({
          type: "create",
          payload: {
            ...order,
            origin,
            id: `${order.id}-${supabase.user.id}-${Date.now()}`,
          },
        }),
      });
      const responseJson = await response.json();
      if (!supabase.user) {
        return;
      }

      supabase.fetchOrders!();

      const orderLink = renderStringBasedOnEnv(
        `https://www.paypal.com/checkoutnow?token=${responseJson.id}`,
        `https://www.sandbox.paypal.com/checkoutnow?token=${responseJson.id}`,
      );
      window.open(orderLink, "_blank")?.focus();

      return responseJson.id;
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  const onApprove = async (data: OnApproveData) => {
    const origin = window.location.origin;
    const captureUrl = `${origin}/api/payment`;

    const response = await fetch(captureUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "capture",
        payload: {
          orderID: data.orderID,
        },
      }),
    });
    const orderData = await response.json();
    if (!supabase.user) {
      return;
    }
    const name = orderData.payer.name.given_name;
    await supabase.updateCredits!(order.credits);

    createToast(`Payment successful! Thank you, ${name}!`, {
      type: "success",
    });
  };

  return (
    <PayPalButtons
      style={{ layout: "horizontal", tagline: false }}
      className="text-slate-50"
      createOrder={createOrder}
      onApprove={onApprove}
    />
  );
};

export default PaymentButtons;
