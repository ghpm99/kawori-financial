import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './landing';
import DashboardPage from './internal/dashboard';

const router = createBrowserRouter([
    { path: '/', element: <LandingPage /> },
    { path: '/dashboard', element: <DashboardPage /> },
]);

export default router;
