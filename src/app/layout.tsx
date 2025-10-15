"use client";

import ThemeProvider from "@/components/themeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import React from "react";
import "../../styles/globals.scss";
import StoreProvider from "./storeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "@/components/providers/auth";

const setInitialTheme = `
    (function() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.className = savedTheme;
    })();
`;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-br">
            <head>
                <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
            </head>
            <body>
                <QueryClientProvider client={queryClient}>
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
                </QueryClientProvider>
            </body>
        </html>
    );
}
