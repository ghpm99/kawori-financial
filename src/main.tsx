import { createRoot } from 'react-dom/client';
import './globals.css';
import AppProvider from './providers/appProvider/index.tsx';
import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './pages/router.tsx';

const Main = () => (
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);

createRoot(document.getElementById('root')!).render(<Main />);
