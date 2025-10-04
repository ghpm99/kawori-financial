import { Outlet } from 'react-router-dom';
import { LayoutProvider } from '../layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '../authProvider';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});
const AppProvider = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <LayoutProvider>
                    <Outlet />
                </LayoutProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default AppProvider;
