"use client";

import React from "react";

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
