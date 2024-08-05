import { useEffect, useState } from "react";

const LOGOS = [
  { name: "Finch", src: "/brands/finch.png", url: "https://tryfinch.com/" },
  {
    name: "Microsoft",
    src: "/brands/microsoft.png",
    url: "https://microsoft.com/",
  },
  { name: "Arch", src: "/brands/arch.png", url: "https://archlabs.com/" },
  { name: "Scale", src: "/brands/scale.png", url: "https://scale.com/" },
  { name: "OpenAI", src: "/brands/openai.png", url: "https://openai.com/" },
  { name: "Coda", src: "/brands/coda.png", url: "https://coda.io/" },
];

const getRandomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const SocialProofBanner = () => {
  return (
    <div className="relative w-full bg-white flex items-center justify-center overflow-hidden ">
      <div className="flex items-center justify-center gap-4 overflow-x-scroll py-8 no-scollbar flex-wrap">
        {LOGOS.map((logo, index) => (
          <a
            key={index}
            href={logo.url}
            target="_blank"
            rel="noreferrer"
            className={`w-24 h-12 mx-4 animate-bob`}
            style={{
              animationDelay: `${index * 100 + getRandomBetween(45, 100)}ms`,
              animationDuration: `${getRandomBetween(3500, 4000)}ms`,
            }}
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="w-full h-full object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  );
};
