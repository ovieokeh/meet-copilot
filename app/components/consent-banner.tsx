import { Transition } from "@headlessui/react";
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BiCookie } from "react-icons/bi";

type Timezone = string;
type Language = string;

function isFromEU(): boolean {
  const euTimezones: Timezone[] = [
    "Europe/Amsterdam",
    "Europe/Andorra",
    "Europe/Athens",
    "Europe/Belgrade",
    "Europe/Berlin",
    "Europe/Bratislava",
    "Europe/Brussels",
    "Europe/Bucharest",
    "Europe/Budapest",
    "Europe/Chisinau",
    "Europe/Copenhagen",
    "Europe/Dublin",
    "Europe/Gibraltar",
    "Europe/Helsinki",
    "Europe/Kaliningrad",
    "Europe/Kiev",
    "Europe/Lisbon",
    "Europe/Ljubljana",
    "Europe/London",
    "Europe/Luxembourg",
    "Europe/Madrid",
    "Europe/Malta",
    "Europe/Monaco",
    "Europe/Moscow",
    "Europe/Oslo",
    "Europe/Paris",
    "Europe/Prague",
    "Europe/Riga",
    "Europe/Rome",
    "Europe/San_Marino",
    "Europe/Sarajevo",
    "Europe/Simferopol",
    "Europe/Skopje",
    "Europe/Sofia",
    "Europe/Stockholm",
    "Europe/Tallinn",
    "Europe/Tirane",
    "Europe/Uzhgorod",
    "Europe/Vaduz",
    "Europe/Vatican",
    "Europe/Vienna",
    "Europe/Vilnius",
    "Europe/Warsaw",
    "Europe/Zagreb",
    "Europe/Zaporozhye",
    "Europe/Zurich",
  ];

  const euLanguages: Language[] = [
    "en-GB",
    "fr-FR",
    "de-DE",
    "es-ES",
    "it-IT",
    "nl-NL",
    "pt-PT",
    "bg-BG",
    "cs-CZ",
    "da-DK",
    "et-EE",
    "el-GR",
    "hr-HR",
    "lv-LV",
    "lt-LT",
    "hu-HU",
    "mt-MT",
    "pl-PL",
    "ro-RO",
    "sk-SK",
    "sl-SI",
    "fi-FI",
    "sv-SE",
  ];

  const userTimezone: Timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userLanguage: Language =
    navigator.language || navigator.languages[0] || "en";

  const isTimezoneInEU = euTimezones.includes(userTimezone);
  const isLanguageInEU = euLanguages.some((lang) =>
    userLanguage.startsWith(lang.split("-")[0]),
  );

  return isTimezoneInEU && isLanguageInEU;
}

type ConsentVisibilityState = "minimized" | "expanded" | "hidden";

const ConsentBanner = () => {
  const [bannerVisibility, setBannerVisibility] =
    useState<ConsentVisibilityState>("hidden");
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = location.pathname;
    const isAppPage = pathname.includes("/app");
    const isFromEUUser = isFromEU();

    if (!isFromEUUser) {
      return;
    }

    if (isAppPage) {
      setBannerVisibility("hidden");
      return;
    } else if (bannerVisibility === "hidden") {
      setBannerVisibility("minimized");
    }

    const hasConsented = localStorage.getItem("hasConsented");
    if (hasConsented) {
      setBannerVisibility("minimized");
      console.log("Consent banner minimized");
    } else {
      setBannerVisibility("expanded");
      console.log("Consent banner expanded");
    }
  }, [location.pathname]);

  const deny = () => {
    localStorage.setItem("hasConsented", "false");
    setBannerVisibility("hidden");

    if (!window.gtag) return;

    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  };

  const accept = () => {
    localStorage.setItem("hasConsented", "true");
    setBannerVisibility("minimized");

    if (!window.gtag) return;

    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
  };

  return (
    <Transition show={bannerVisibility !== "hidden"}>
      {bannerVisibility === "minimized" ? (
        <div className="fixed bottom-9 left-4 z-50">
          <button
            className="border-slate-50 bg-slate-200 text-slate-700 px-4 py-2 rounded-full"
            onClick={() => setBannerVisibility("expanded")}
          >
            <BiCookie className="size-8" />
          </button>
        </div>
      ) : (
        <div className="bg-slate-100 text-slate-900 p-4 fixed bottom-9 left-4 right-4 z-50 rounded">
          <p className="flex flex-col gap-2">
            <span className="font-semibold">Cookie consent:</span>
            <span>
              We use cookies to improve your experience on our site. To learn
              more, read our
              <Link to="/privacy-policy" className="pl-1 underline">
                privacy policy.
              </Link>
            </span>
            <span>
              Please note that if you choose to use the service (even if you
              deny consent), you agree to the use of some minimum required
              cookies. This is necessary for the service to function
            </span>
          </p>

          <div className="flex gap-2">
            <button
              className="border-slate-700 border text-slate-700 px-4 py-2 mt-2 rounded"
              onClick={deny}
            >
              Deny
            </button>
            <button
              className="bg-slate-700 border text-slate-50 px-4 py-2 mt-2 rounded"
              onClick={accept}
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default ConsentBanner;
