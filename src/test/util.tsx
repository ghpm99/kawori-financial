import { AuthProvider } from "@/components/providers/auth";
import ThemeProvider from "@/components/providers/themeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

const renderWithProviders = (element: React.ReactNode) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>{element}</AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>,
    );
};

export default renderWithProviders;
