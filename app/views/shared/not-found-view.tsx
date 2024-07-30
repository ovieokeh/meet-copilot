import { Link } from "@remix-run/react";

export function NotFoundView({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100dvh-60px)] w-full px-4 py-12">
      {message ? (
        <p className="text-lg font-normal">{message}</p>
      ) : (
        <>
          <h1 className="text-4xl font-bold">404 Not Found</h1>

          <p className="text-lg font-normal">
            The page you are looking for does not exist.
          </p>

          <p className="text-lg font-normal">
            Please check the URL and try again.
          </p>
        </>
      )}

      <Link
        to="/"
        className="mt-8 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded w-fit"
      >
        Go to Home
      </Link>
    </div>
  );
}
