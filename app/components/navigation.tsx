import { useLocation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import Hamburger from "./hamburger";

interface NavLinkType {
  name: string;
  href: string;
  position: string[];
}

const NAV_LINKS: NavLinkType[] = [
  {
    name: "FAQ",
    href: "/faq",
    position: ["top", "bottom"],
  },
  {
    name: "Pricing",
    href: "/credits",
    position: ["top", "bottom"],
  },
  {
    name: "Contact",
    href: "/contact",
    position: ["top", "bottom"],
  },
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
    position: ["bottom"],
  },
  {
    name: "Terms of Service",
    href: "/terms-of-service",
    position: ["bottom"],
  },
  {
    name: "App",
    href: "/app",
    position: ["top"],
  },
];

const NavLink = ({
  link,
  isActive,
  className,
}: {
  link: NavLinkType;
  isActive: boolean;
  className?: string;
}) => {
  return (
    <a
      href={link.href}
      className={twMerge(
        "inline-block px-4 py-2 rounded-md hover:bg-slate-800 hover:text-slate-50 transition-colors ease-in-out duration-300",
        isActive ? "text-slate-300" : "text-slate-300",
        link.href === "/app" ? "bg-blue-700 text-slate-50" : "",
        className,
      )}
    >
      {link.name}
    </a>
  );
};

const useOnClickOutside = (
  refs: React.RefObject<Element>[],
  handler: (event: MouseEvent | TouchEvent) => void,
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const isOutside = refs.every((ref) => {
        return ref.current && !ref.current.contains(event.target as Node);
      });

      if (!isOutside) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs, handler]);
};

export const NavigationTop = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  useOnClickOutside([dropdownRef, hamburgerRef], () =>
    setIsDropdownOpen(false),
  );

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  const shouldRender = !location.pathname.includes("app");
  if (!shouldRender) return null;

  const TOP_LINKS = NAV_LINKS.filter((link) => link.position.includes("top"));

  return (
    <nav className="h-[60px] sticky top-0 z-30">
      <div className="bg-slate-900 text-slate-50 mx-auto flex items-center justify-between p-4 sm:p-8">
        <a href="/" className="font-bold text-xl">
          Meet Copilot
        </a>

        <div className="hidden md:flex gap-2">
          {TOP_LINKS.map((link, index) => (
            <NavLink
              key={index}
              link={link}
              isActive={isActiveLink(link.href)}
            />
          ))}
        </div>

        <button
          ref={hamburgerRef}
          className="text-slate-50 relative md:hidden rotate-90 translate-y-0"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Hamburger className="bg-slate-50" isOpen={isDropdownOpen} />
        </button>
      </div>

      <div
        ref={dropdownRef}
        className={twMerge(
          "md:hidden bg-slate-800 h-fit absolute w-full z-30 transition-all ease-in-out duration-300",
          isDropdownOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none z-0",
        )}
      >
        <div className="container mx-auto flex flex-col gap-4 p-4">
          {TOP_LINKS.map((link, index) => (
            <NavLink
              key={index}
              link={link}
              isActive={isActiveLink(link.href)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

export const NavigationBottom = () => {
  const location = useLocation();

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  const BOTTOM_LINKS = NAV_LINKS.filter((link) =>
    link.position.includes("bottom"),
  );

  const shouldRender = !location.pathname.includes("app");
  if (!shouldRender) return null;

  return (
    <nav
      style={{ zIndex: 9999999999 }}
      className="z-20 py-12 sm:py-4  bg-slate-100 relative text-slate-900 w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center flex-wrap sm:justify-between gap-6 px-4 sm:px-8 py-2 sm:p-8 sm:max-w-3xl sm:mx-auto">
        {BOTTOM_LINKS.map((link, index) => (
          <NavLink
            key={index}
            link={link}
            isActive={isActiveLink(link.href)}
            className="text-slate-900"
          />
        ))}
      </div>
    </nav>
  );
};
