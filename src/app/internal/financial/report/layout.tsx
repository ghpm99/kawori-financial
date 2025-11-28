"use client";

import { ReportProvider } from "@/components/providers/report";

const ReportLayout = ({ children }: { children: React.ReactNode }) => <ReportProvider>{children}</ReportProvider>;

export default ReportLayout;
