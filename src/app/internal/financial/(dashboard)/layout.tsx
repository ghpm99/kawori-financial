"use client";

import { DashboardProvider } from "@/components/providers/dashboard";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
    <DashboardProvider>{children}</DashboardProvider>
);

export default DashboardLayout;
