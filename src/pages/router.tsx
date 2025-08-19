import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import LandingPage from './landing';
import DashboardPage from './internal/financial/dashboard';
import InternalLayout from '@/components/internal/layout';
import AppProvider from '@/providers/appProvider';
import ErrorPage from './error';
import InvoicesPage from './internal/financial/invoices';
import PaymentsPage from './internal/financial/payments';
import ReportsPage from './internal/financial/reports';
import BudgetPage from './internal/financial/budget';

const internalRouters: RouteObject[] = [
    { path: 'dashboard', element: <DashboardPage /> },
    { path: 'reports', element: <ReportsPage /> },
    { path: 'invoices', element: <InvoicesPage /> },
    { path: 'payments', element: <PaymentsPage /> },
    { path: 'budget', element: <BudgetPage /> },
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
