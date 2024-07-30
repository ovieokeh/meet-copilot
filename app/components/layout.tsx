import { Outlet, useLocation } from "@remix-run/react";
import { useEffect } from "react";

import { ClientDatabaseContextProvider } from "~/contexts/client-database-context";

import { NavigationBottom, NavigationTop } from "./navigation";

const Layout = () => {
  const location = useLocation();
  const isViewWithScroll = ["meetings"].some(
    (path) => location.pathname === "/" || !location.pathname.includes(path),
  );

  useEffect(() => {
    if (!isViewWithScroll) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isViewWithScroll]);

  return (
    <div
      className={`sm:h-auto h-full w-full bg-slate-900 text-slate-50 ${
        isViewWithScroll ? "" : "overflow-hidden"
      }`}
    >
      <ClientDatabaseContextProvider>
        <div className="w-full max-w-[1920px] mx-auto">
          <NavigationTop />
          <Outlet />
          <NavigationBottom />
        </div>
      </ClientDatabaseContextProvider>
    </div>
  );
};

export default Layout;
