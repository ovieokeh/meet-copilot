import { ActionFunctionArgs } from "@remix-run/node";

import { createSBServerClient } from "~/models/supabase.server";
import { createResponse } from "~/utils";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (request.method !== "DELETE") {
    return createResponse({
      status: 405,
      body: { error: "Method not allowed" },
    });
  }

  const { headers } = request;
  const supabase = createSBServerClient(request, headers);

  const supabaseUser = await supabase.auth.getUser();
  const supbaseUserId = supabaseUser.data.user?.id;

  if (!supbaseUserId) {
    return createResponse({
      status: 401,
      body: { error: "Unauthorized" },
    });
  }

  const deleteResponse = await supabase.auth.admin.deleteUser(supbaseUserId);
  if (deleteResponse.error) {
    return createResponse({
      status: 500,
      body: { error: deleteResponse.error.message },
    });
  }

  return createResponse({ message: "User deleted" }, 204, {
    "Set-Cookie": "session=; Path=/; Max-Age=0",
  });
};
