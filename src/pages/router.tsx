import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import LandingPage from './landing';
import DashboardPage from './internal/dashboard';
import InternalLayout from '@/components/internal/layout';
import AppProvider from '@/providers/appProvider';
import ErrorPage from './error';

const internalRouters: RouteObject[] = [
    { path: 'dashboard', element: <DashboardPage /> },
    { path: '*', element: <ErrorPage /> },
];

const routers: RouteObject[] = [
    { index: true, element: <LandingPage /> },
    {
        path: 'financial',
        element: <InternalLayout />,
        errorElement: <ErrorPage />,
        children: internalRouters,
    },
];

const router = createBrowserRouter([
    {
        path: '/',
        element: <AppProvider />,
        errorElement: <ErrorPage />,
        children: routers,
    },
]);

export default router;
