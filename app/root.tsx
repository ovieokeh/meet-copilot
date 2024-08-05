import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import Layout from "./components/layout";
import stylesheet from "./tailwind.css?url";
import { NotFoundView } from "./views/shared/not-found-view";
import { SupabaseContextProvider } from "./contexts/supabase-context";
import ConsentBanner from "./components/consent-banner";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader: LoaderFunction = async ({ request }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLIC_ANON_KEY;

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
};

export default function App() {
  const loaderData = useLoaderData<{
    supabaseUrl?: string;
    supabaseAnonKey?: string;
  }>();

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <ConsentBanner />
        <SupabaseContextProvider
          supabaseUrl={loaderData.supabaseUrl}
          supabaseAnonKey={loaderData.supabaseAnonKey}
        >
          <PayPalScriptProvider
            options={{
              clientId:
                "AQ-WE1S9fQK5jrRaMc0Ktjm8m36iLM-YLHe5JA7_vlfmwDl6qv5EmakCGk2NkQ2ctQdz97cFfw_ziVa7",
            }}
          >
            <Layout />
          </PayPalScriptProvider>
        </SupabaseContextProvider>
        <ScrollRestoration />
        <Scripts />

        <script
          src="https://code.tidio.co/05oalilgkzbydhkehirqbisweeqbartp.js"
          async
        ></script>
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html lang="en">
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <NotFoundView />
        <Scripts />
      </body>
    </html>
  );
}
