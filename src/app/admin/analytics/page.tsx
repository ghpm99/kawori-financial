"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";

import { setSelectedMenu } from "@/lib/features/auth";
import { useAppDispatch } from "@/lib/hooks";
import { fetchNewUsersAnalytics } from "@/services/analytics";

const AnalyticsPage = () => {
    const dispatch = useAppDispatch();
    const { data: newUserData, isLoading: isLoadingNewUserData } = useQuery({
        queryKey: ["analytics", "newUsers"],
        queryFn: async () => {
            const response = await fetchNewUsersAnalytics();
            return response.data.new_users;
        },
    });

    useEffect(() => {
        document.title = "Kawori Analytics";
        dispatch(setSelectedMenu(["analytics"]));
    }, []);

    return (
        <div>
            <Card loading={isLoadingNewUserData}>Novos usuarios: {newUserData}</Card>
        </div>
    );
};

export default AnalyticsPage;
