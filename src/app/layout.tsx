"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import React from "react";
import "../../styles/globals.scss";

import AppProviders from "@/components/providers";

const setInitialTheme = `
    (function() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.className = savedTheme;
    })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-br">
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
