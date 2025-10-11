"use client";
import AuthProvider from "@/components/authProvider";
import ThemeProvider from "@/components/themeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import React from "react";
import "../../styles/globals.scss";
import StoreProvider from "./storeProvider";

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
                <ThemeProvider>
                    <StoreProvider>
                        <AntdRegistry>
                            <AuthProvider>
                                {children}
                                <Analytics />
                                <SpeedInsights />
                            </AuthProvider>
                        </AntdRegistry>
                    </StoreProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
