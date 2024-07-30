import { generateAuthUrl } from "~/controllers/google-controller";
import { safeRedirect } from "~/utils";

export const loader = async () => {
  const url = generateAuthUrl();
  return safeRedirect(url);
};
