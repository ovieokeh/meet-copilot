import { OnApproveData, OnApproveActions } from "@paypal/paypal-js";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { FC, useState } from "react";
import { useSupabase } from "~/contexts/supabase-context";
import { PaymentOrder } from "~/types";

const PaymentButtons: FC<{
  order: PaymentOrder;
}> = ({ order }) => {
  const supabase = useSupabase();
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  const createOrder = async () => {
    setButtonState("loading");
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
      // construct the orderLink using the response from the server
      const orderLink = `https://www.sandbox.paypal.com/checkoutnow?token=${responseJson.id}`;
      window.open(orderLink, "_blank")?.focus();

      setButtonState("idle");

      return responseJson.id;
    } catch (error) {
      console.error("Failed to create order:", error);
      setButtonState("error");
    }
  };
  // const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
  //   const response = await fetch(
  //     "https://sandbox.paypal.com/capture-paypal-order",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         orderID: data.orderID,
  //       }),
  //     },
  //   );
  //   const orderData = await response.json();
  //   if (!supabase.user) {
  //     return;
  //   }
  //   const name = orderData.payer.name.given_name;
  //   await supabase.updateCredits!(order.credits);
  //   alert(`Transaction completed by ${name}`);
  // };

  const orders = supabase.orders;

  const hasExistingOrder = orders.some(
    (o) => o.product === order.title && o.status === "CREATED",
  );
  const isDisabled = buttonState === "loading" || hasExistingOrder;

  return (
    <button
      className={`border border-slate-100 px-4 py-2 ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
      onClick={createOrder}
      disabled={isDisabled}
    >
      Buy Now {hasExistingOrder ? `(There's a pending order)` : ""}
    </button>
  );
};

export default PaymentButtons;
