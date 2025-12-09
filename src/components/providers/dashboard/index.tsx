import { apiDjango } from "@/services";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { createContext, ReactNode, useContext } from "react";
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    TrophyOutlined,
    RiseOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import {
    fetchAmountPaymentReportService,
    fetchFinancialMetricsService,
    fetchPaymentReportService,
} from "@/services/financial/report";
import { formatterMonthYearDate } from "@/util";

type CardStatus = "positive" | "negative" | "neutral";
type CardProps = {
    value: number;
    loading: boolean;
    color: string;
    metricIcon: ReactNode;
    metric_value: number;
    status: CardStatus;
};

type PaymentsChart = {
    month: string;
    revenue: number;
    expenses: number;
};
type DashboardContextData = {
    revenues: CardProps;
    expenses: CardProps;
    profit: CardProps;
    growth: Omit<CardProps, "metric_value">;
    paymentsChart: PaymentsChart[];
};

const DashboardContext = createContext({} as DashboardContextData);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const {
        data: metricsData = {
            revenues: { value: 0, metric_value: 1 },
            expenses: { value: 0, metric_value: 1 },
            profit: { value: 0, metric_value: 1 },
            growth: { value: 0 },
        },
        isLoading: isLoadingMetrics,
    } = useQuery({
        queryKey: ["metrics_get_total"],
        queryFn: fetchFinancialMetricsService,
    });

    const { data: paymentData } = useQuery({
        queryKey: ["paymentReport"],
        queryFn: fetchPaymentReportService,
    });

    const generateCardIconAndStatus = (
        metricValue: number,
        inverseStatus: boolean = false,
    ): { metricIcon: ReactNode; status: CardStatus } => {
        if (metricValue < 1) {
            return {
                metricIcon: <ArrowDownOutlined />,
                status: inverseStatus ? "positive" : "negative",
            };
        }
        if (metricValue > 1) {
            return {
                metricIcon: <ArrowUpOutlined />,
                status: inverseStatus ? "negative" : "positive",
            };
        }

        return {
            metricIcon: <ArrowUpOutlined />,
            status: "neutral",
        };
    };

    const paymentChartData =
        paymentData?.payments.map((payment) => ({
            month: formatterMonthYearDate(payment.label),
            revenue: payment.credit,
            expenses: payment.debit,
        })) || [];

    const contextValue: DashboardContextData = {
        ...metricsData,
        revenues: {
            ...metricsData.revenues,
            ...generateCardIconAndStatus(metricsData.revenues.metric_value),
            loading: isLoadingMetrics,
            color: "green",
        },
        expenses: {
            ...metricsData.expenses,
            ...generateCardIconAndStatus(metricsData.expenses.metric_value, true),
            loading: isLoadingMetrics,
            color: "red",
        },
        profit: {
            ...metricsData.profit,
            ...generateCardIconAndStatus(metricsData.profit.metric_value),
            loading: isLoadingMetrics,
            color: "green",
        },
        growth: {
            ...metricsData.growth,
            loading: isLoadingMetrics,
            color: "#722ed1",
            metricIcon: <ArrowUpOutlined />,

            status: "positive",
        },
        paymentsChart: paymentChartData,
    };

    return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>;
};

export function useDashboard() {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }

    return context;
}
