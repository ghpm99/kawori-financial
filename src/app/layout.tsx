import React from "react";

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/styles/globals.scss";

import AppProviders from "@/components/providers";

const setInitialTheme = `
    (function() {
        // Only run on client
        if (typeof window === 'undefined') return;

        const savedTheme = localStorage.getItem('theme') || 'light';
        const root = document.documentElement;

        // Prevent FOUC (Flash of Unstyled Content)
        root.style.visibility = 'hidden';
        root.className = savedTheme;

        // Force a reflow to ensure the class is applied before showing content
        root.offsetHeight;
        root.style.visibility = '';
    })();
`;

export const metadata: Metadata = {
    metadataBase: new URL("https://financeiro.kawori.site"),
    title: {
        default: "Kawori Financial",
        template: "%s | Kawori Financial",
    },
    description:
        "Controle financeiro pessoal para organizar gastos, receitas, orçamentos e metas com relatórios claros.",
    openGraph: {
        type: "website",
        siteName: "Kawori Financial",
        title: "Kawori Financial",
        description:
            "Controle financeiro pessoal para organizar gastos, receitas, orçamentos e metas com relatórios claros.",
        locale: "pt_BR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Kawori Financial",
        description:
            "Controle financeiro pessoal para organizar gastos, receitas, orçamentos e metas com relatórios claros.",
    },
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-br" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
            </head>
            <body>
                <AppProviders>
                    {children}
                    <Analytics />
                    <SpeedInsights />
                </AppProviders>
            </body>
        </html>
    );
}
