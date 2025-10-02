import InternalLayout from '@/components/internal/layout';
import AppProvider from '@/providers/appProvider';
import LandingLayout from '@/providers/layout/landingLayout';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import AuthPage from './auth';
import ErrorPage from './error';
import BudgetPage from './internal/financial/budget';
import WrappedContractPage from './internal/financial/contracts';
import DashboardPage from './internal/financial/dashboard';
import InvoicesPage from './internal/financial/invoices';
import PaymentsPage from './internal/financial/payments';
import ReportsPage from './internal/financial/reports';
import LandingPage from './landing';
import SigninPage from './signin';
import SignupPage from './signup';

const internalRouters: RouteObject[] = [
    { path: 'dashboard', element: <DashboardPage /> },
    { path: 'reports', element: <ReportsPage /> },
    { path: 'contracts', element: <WrappedContractPage /> },
    { path: 'invoices', element: <InvoicesPage /> },
    { path: 'payments', element: <PaymentsPage /> },
    { path: 'budget', element: <BudgetPage /> },
    { path: '*', element: <ErrorPage /> },
];

const landingRouters: RouteObject[] = [
    { index: true, element: <LandingPage /> },
    { path: 'signin', element: <SigninPage /> },
    { path: 'signup', element: <SignupPage /> },
    { path: 'auth', element: <AuthPage /> },
];

const routers: RouteObject[] = [
    {
        path: '/',
        element: <LandingLayout />,
        children: landingRouters,
    },
    {
        path: '/financial',
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
