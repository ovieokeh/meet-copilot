import { Link, useLocation } from "@remix-run/react";
import { MdChevronRight } from "react-icons/md";

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const Breadcrumbs = () => {
  const location = useLocation();

  let path = location.pathname.split("/").filter(Boolean);
  path = path.slice(0, path.length - 1);

  return (
    <nav className="flex items-center px-4 gap-2 text-sm">
      {["home", ...path].map((part, index) => (
        <Link
          key={part}
          to={part === "home" ? "/" : `/${part}`}
          className={`text-slate-500 flex items-center gap-2 ${
            index === path.length ? "text-slate-800 font-semibold" : ""
          }`}
        >
          {index !== 0 ? (
            <span>
              <MdChevronRight />
            </span>
          ) : null}
          <span>{capitalize(part)}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
