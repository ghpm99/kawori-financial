import { userDetailThunk, userGroupsThunk, verifyTokenThunk } from '@/lib/features/auth';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useCallback, useEffect } from 'react';
import { LOCAL_STORE_ITEM_NAME } from '../../components/constants';
import { useQuery } from '@tanstack/react-query';
import { verifyTokenService } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const { data, refetch } = useQuery({
        queryKey: ['verifyToken'],
        queryFn: () => verifyTokenService(),
        enabled: false,
    });

    const verifyLocalStore = (): boolean => {
        const localStorageToken = localStorage.getItem(LOCAL_STORE_ITEM_NAME);

        if (!localStorageToken) {
            return false;
        }
        const dateNow = new Date();
        const tokenDate = new Date(localStorageToken);

        return dateNow < tokenDate;
    };

    useEffect(() => {
        if (verifyLocalStore()) {
            console.log(data);
        }
    }, []);

    useEffect(() => {
        const handleTokenRefreshFailed = () => {
            navigate('/signout');
        };

        window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailed);

        return () => {
            window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailed);
        };
    }, [navigate]);

    return children;
};

export default AuthProvider;
