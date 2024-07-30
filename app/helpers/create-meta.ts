export const createMeta = (
  title: string,
  description: string,
  image?: string,
) => {
  return [
    {
      title,
    },
    { name: "description", content: description },

    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "og:image", content: image || "/home-hero.jpg" },

    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: image || "/home-hero.jpg" },

    { name: "favicon", content: "/favicon.svg" },
  ];
};
