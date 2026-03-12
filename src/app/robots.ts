import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://financeiro.kawori.site";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/internal"],
            },
            {
                userAgent: ["GPTBot", "ChatGPT-User", "anthropic-ai", "Claude-Web", "CCBot"],
                allow: ["/", "/llms.txt"],
                disallow: ["/admin", "/internal"],
            },
            {
                userAgent: ["Googlebot", "Bingbot"],
                allow: "/",
                disallow: ["/admin", "/internal"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
