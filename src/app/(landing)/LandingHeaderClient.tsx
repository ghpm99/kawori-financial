"use client";

import MenuHeader from "@/components/menuHeader";
import { useAuth } from "@/components/providers/auth";

const LandingHeaderClient = () => {
    const { authState, isLoading, signOut } = useAuth();

    return <MenuHeader authState={authState} isLoading={isLoading} signOut={signOut} />;
};

export default LandingHeaderClient;
