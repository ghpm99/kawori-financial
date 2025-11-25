import { AntdRegistry } from "@ant-design/nextjs-registry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AuthProvider from "./auth";
import { LayoutProvider } from "./layout";
import UserProvider from "./user";
import ThemeProvider from "./themeProvider";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

const AppProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <AntdRegistry>
                <AuthProvider>
                    <UserProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </UserProvider>
                </AuthProvider>
            </AntdRegistry>
        </ThemeProvider>
    </QueryClientProvider>
);

export default AppProviders;
