import { Outlet } from 'react-router-dom';
import { LayoutProvider } from '../layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
            <LayoutProvider>
                <Outlet />
            </LayoutProvider>
        </QueryClientProvider>
    );
};

export default AppProvider;
