import router from '@/pages/router';
import React, { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';

const AppProvider = () => {
    return (
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>
    );
};

export default AppProvider;
