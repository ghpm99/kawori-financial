import { Outlet } from 'react-router-dom';
import { LayoutProvider } from '../layout';

const AppProvider = () => {
    return (
        <LayoutProvider>
            <Outlet />
        </LayoutProvider>
    );
};

export default AppProvider;
