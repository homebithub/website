export function loader() {
    const baseUrl = "https://homebit.co.ke";

    const pages = [
        { loc: "/", priority: "1.0", changefreq: "daily" },
        { loc: "/about", priority: "0.8", changefreq: "monthly" },
        { loc: "/services", priority: "0.9", changefreq: "weekly" },
        { loc: "/pricing", priority: "0.9", changefreq: "weekly" },
        { loc: "/contact", priority: "0.7", changefreq: "monthly" },
        { loc: "/login", priority: "0.5", changefreq: "yearly" },
        { loc: "/signup", priority: "0.6", changefreq: "yearly" },
        { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
        { loc: "/terms", priority: "0.3", changefreq: "yearly" },
        { loc: "/cookies", priority: "0.2", changefreq: "yearly" },
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
    .map(
        (page) => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
        },
    });
}
