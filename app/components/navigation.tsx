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
    name: "Home",
    href: "/",
    position: ["top"],
  },
  {
    name: "Pricing",
    href: "/credits",
    position: ["top", "bottom"],
  },
  {
    name: "FAQ",
    href: "/faq",
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
        "inline-block",
        isActive ? "text-slate-300" : "text-slate-50",
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
      <div className="bg-slate-900 text-slate-50 mx-auto flex items-center justify-between p-4">
        <a href="/" className="font-bold text-xl">
          Meet Copilot
        </a>

        <div className="hidden md:flex gap-4">
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
    <nav className="bg-slate-100 text-slate-900 flex items-center justify-center w-full">
      <div className="flex items-center flex-wrap justify-between gap-4 p-4 sm:p-8">
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
