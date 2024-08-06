import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import Layout from "./components/layout";
import stylesheet from "./tailwind.css?url";
import { NotFoundView } from "./views/shared/not-found-view";
import { SupabaseContextProvider } from "./contexts/supabase-context";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader: LoaderFunction = async ({ request }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLIC_ANON_KEY;
  const gaTrackingId = process.env.GA_TRACKING_ID;

  return {
    supabaseUrl,
    supabaseAnonKey,
    gaTrackingId,
  };
};

export default function App() {
  const loaderData = useLoaderData<{
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    gaTrackingId?: string;
  }>();

  const gaTrackingId = loaderData.gaTrackingId;

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
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
            <script
              src="https://code.tidio.co/05oalilgkzbydhkehirqbisweeqbartp.js"
              async
            ></script>
            {process.env.NODE_ENV === "development" || !gaTrackingId ? null : (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
                />
                <script
                  async
                  id="gtag-init"
                  dangerouslySetInnerHTML={{
                    __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${gaTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
                  }}
                />
              </>
            )}
          </PayPalScriptProvider>
        </SupabaseContextProvider>
        <ScrollRestoration />
        <Scripts />
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
