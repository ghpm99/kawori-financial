import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    signinService,
    verifyTokenService,
    type ISigninArgs,
    type ISigninResponse,
} from '@/services/auth';
import { useMutation, useQuery, type UseMutateFunction } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LOCAL_STORE_ITEM_NAME } from '../../components/constants';
import type { AxiosResponse } from 'axios';

type AuthContextType = {
    isAuthenticated: boolean;
    verify: () => Promise<void>;
    signOut: () => void;
    lastVerifyData?: unknown;
    signinMutate: UseMutateFunction<
        AxiosResponse<ISigninResponse, any>,
        Error,
        ISigninArgs,
        unknown
    >;
};

interface AccountStore {
    access: string;
    refresh: string;
    auth: boolean;
    error: string;
    remember: boolean;
    theme: Theme;
    modalChangePassword: IModalChangePassword;
}

interface IModalChangePassword {
    data: IModalChangePasswordData;
    visible: boolean;
    errors: IErrors[];
}

interface IErrors {
    label: string;
    error: string;
}

interface IModalChangePasswordData {
    current_password: string;
    new_password: string;
    re_new_password: string;
}

type ActionChangeTheme = {
    theme: Theme;
};

type Theme = 'dark' | 'light';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const verifyLocalStore = (): boolean => {
    const localStorageToken = localStorage.getItem(LOCAL_STORE_ITEM_NAME);
    if (!localStorageToken) return false;
    const dateNow = new Date();
    const tokenDate = new Date(localStorageToken);
    return dateNow < tokenDate;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const accountStore = useSelector((state: RootState) => state.common.account);
    const theme = useSelector((state: RootState) => state.common.account.theme);

    const [searchParams] = useSearchParams();

    const accessToken = searchParams.get('access');
    const refreshToken = searchParams.get('refresh');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [remember, setRemember] = useState(true);

    // const initialCaptchaRef: any = null
    // const captchaRef = useRef(initialCaptchaRef)
    // const [displayCaptchaError, setDisplayCaptchaError] = useState(true)

    const inputPasswordType = showPassword ? 'text' : 'password';
    const iconPassword = showPassword ? visibily : visibilyOff;

    const togglePasswordVisible = () => {
        setShowPassword((prev) => !prev);
    };

    const getUserByParams = () => {
        if (!accessToken || !refreshToken) {
            return undefined;
        }
        const user: IUser = {
            theme: theme,
            tokens: {
                access: accessToken,
                refresh: refreshToken,
            },
            remember: true,
        };
        return user;
    };

    const updateValidatedToken = (user: IUser) => {
        dispatch(setToken(user));
    };

    const verifyToken = (user: IUser) => {
        verifyTokenService(user.tokens.access)
            .then(() => {
                updateValidatedToken(user);
            })
            .catch(() => {
                refreshTokenAccess(user);
            });
    };

    const refreshTokenAccess = (user: IUser) => {
        refreshTokenService(user.tokens.refresh).then((response) => {
            updateValidatedToken({
                ...user,
                tokens: {
                    ...user.tokens,
                    access: response.data.access,
                },
            });
        });
    };

    useEffect(() => {
        const user = getUserByParams() ?? TokenService.getUser();
        if (user) {
            verifyToken(user);
        }
    }, []);

    useEffect(() => {
        if (accountStore.auth) {
            dispatch(fetchApplicationConfigurationThunk()).then((value) => {
                const payload = value.payload as any;

                if (isFulfilled(value)) {
                    switch (payload.user_details.user_type) {
                        case 'partner':
                            fetchPartnerStatusService()
                                .then((res) => {
                                    if (res.data.status === 1) {
                                        navigate('/dash/overview?new_user=true');
                                    } else {
                                        navigate('/dash/overview');
                                    }
                                })
                                .catch(() => navigate('/dash/overview'));
                            break;
                        case 'ecommerce':
                            navigate('/dash_ecommerce/overview');
                            break;
                        default:
                            TokenService.removeUser();
                            window.location.replace(
                                `${urlDjangoProject(
                                    '/partners/api/dash/auth/hub/',
                                    accountStore.access,
                                    accountStore.refresh,
                                )}`,
                            );
                            break;
                    }
                }
            });
        }
    }, [accountStore.auth]);

    // const clearCaptchaError = () => {
    //     setDisplayCaptchaError(false)
    // }

    // const getCaptchaToken = (captchaRef: React.MutableRefObject<any>) => {
    //     let captchaToken = ''

    //     if (captchaRef && captchaRef.current) {
    //         captchaToken = captchaRef.current.getValue()
    //         captchaRef.current.reset()
    //     }

    //     return captchaToken
    // }

    const onSubmit = (event: React.MouseEvent<HTMLInputElement>) => {
        event.preventDefault();

        // const captchaToken = getCaptchaToken(captchaRef)
        // if (captchaToken === '') {
        //     dispatch(setAccountErrorReducer('Captcha inválido'))
        // } else {
        //     dispatch(
        //         loginReducer({
        //             username,
        //             password,
        //             remember,
        //             captchaToken,
        //         })
        //     )
        // }

        // Remove this code if captcha will be activated
        const captchaToken = '';
        dispatch(
            loginReducer({
                username,
                password,
                remember,
                captchaToken,
            }),
        );
    };

    const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.id === 'username') {
            setUsername(e.target.value);
        }
        if (e.target.id === 'password') {
            setPassword(e.target.value);
        }
    };

    const changeRemember = ({ target }: CheckboxChangeEvent) => {
        const { checked } = target;
        setRemember(checked);
        TokenService.removeUser();
    };

    const errorLogin = accountStore.error ?? undefined;

    return {
        theme,
        onSubmit,
        username,
        password,
        remember,
        changeValue,
        changeRemember,
        inputPasswordType,
        iconPassword,
        togglePasswordVisible,
        errorLogin,
        // captchaPublicKey,
        // captchaRef,
        // displayCaptchaError,
        // clearCaptchaError,
    };

    const value: AuthContextType = {
        isAuthenticated,
        verify,
        signOut,
        lastVerifyData: data,
        signinMutate,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthProvider;
