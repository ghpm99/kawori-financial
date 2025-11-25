import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { userDetailService, userGroupsService } from "@/services/user";

import { useAuth } from "../auth";

export type UserGroup = {
    id: string;
    name: string;
};

export interface IUserData {
    id: number;
    name: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_staff: boolean;
    is_active: boolean;
    is_superuser: boolean;
    last_login: string;
    date_joined: string;
    image?: string;
}

type UserContextType = {
    user?: IUserData;
    groups?: string[];
    loading: boolean;
    error: Error | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [localUser, setLocalUser] = useState<IUserData | null>(null);

    const {
        data: userData,
        refetch: refetchUser,
        isLoading,
        error,
    } = useQuery<AxiosResponse<IUserData>, Error>({
        queryKey: ["user", "account"],
        queryFn: userDetailService,
        enabled: isAuthenticated,
    });

    const { data: userGroupsData, refetch: refetchUserGroups } = useQuery<AxiosResponse<{ data: string[] }>, Error>({
        queryKey: ["user", "groups"],
        queryFn: userGroupsService,
        enabled: isAuthenticated,
    });

    useEffect(() => {
        if (isAuthenticated) {
            refetchUser();
            refetchUserGroups();
        }
    }, [isAuthenticated, refetchUser, refetchUserGroups]);

    const value = useMemo<UserContextType>(
        () => ({
            user: localUser ?? (userData ? userData.data : undefined),
            groups: userGroupsData ? userGroupsData.data.data : [],
            loading: isLoading,
            error: error ?? null,
        }),
        [localUser, userData, userGroupsData, isLoading, error],
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within UserProvider");
    return ctx;
};

export default UserProvider;
