import { OnApproveData, OnApproveActions } from "@paypal/paypal-js";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { FC } from "react";
import { useSupabase } from "~/contexts/supabase-context";
import { PaymentOrder } from "~/types";

const PaymentButtons: FC<{
  order: PaymentOrder;
}> = ({ order }) => {
  const supabase = useSupabase();

  const createOrder = async () => {
    const origin = window.location.origin;
    const orderUrl = `${origin}/api/payment`;
    const response = await fetch(orderUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // use the "body" param to optionally pass additional order information
      // like product ids and quantities
      body: JSON.stringify({
        type: "create",
        payload: { ...order, origin },
      }),
    });
    const responseJson = await response.json();
    if (!supabase.user) {
      return;
    }
    return responseJson.id;
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

  return <button onClick={createOrder}>Buy Now</button>;
};

export default PaymentButtons;
