export function PageHeader({
  title,
  description,
  coverImage = "/home-hero.jpg",
}: {
  title: string;
  description: string;
  coverImage?: string;
}) {
  return (
    <div>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {coverImage ? <meta property="og:image" content={coverImage} /> : null}
      {coverImage ? (
        <meta property="twitter:image" content={coverImage} />
      ) : null}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:card" content="summary_large_image" />

      <link rel="icon" type="image/png" href="/favicon.svg" sizes="32x32" />
    </div>
  );
}
