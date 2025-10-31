import { AntdRegistry } from "@ant-design/nextjs-registry";
import AuthProvider from "./auth";
import UserProvider from "./user";
import StoreProvider from "@/app/storeProvider";
import ThemeProvider from "@/components/themeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayoutProvider } from "./layout";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

const AppProviders = ({ children }) => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <StoreProvider>
                <AntdRegistry>
                    <AuthProvider>
                        <UserProvider>
                            <LayoutProvider>{children}</LayoutProvider>
                        </UserProvider>
                    </AuthProvider>
                </AntdRegistry>
            </StoreProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default AppProviders;
