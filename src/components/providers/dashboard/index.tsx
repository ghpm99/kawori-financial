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
import { fetchAmountPaymentReportService, fetchPaymentReportService } from "@/services/financial/report";
import { formatterMonthYearDate } from "@/util";

type CardProps = {
    value: number;
    loading: boolean;
    color: string;
    metricIcon: ReactNode;
    metric_value: number;
    status: "positive" | "negative" | "neutral";
};

type PaymentsChart = {
    month: string;
    revenue: number;
    expenses: number;
};
type DashboardContextData = {
    revenue: CardProps;
    expenses: CardProps;
    profit: CardProps;
    growth: CardProps;
    paymentsChart: PaymentsChart[];
};

const DashboardContext = createContext({} as DashboardContextData);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const { data: earningsGetTotal = { value: 0, metric_value: 1 }, isLoading: isLoadingEarningsGetTotal } = useQuery({
        queryKey: ["earnings_get_total"],
        queryFn: async () => {
            const response = await apiDjango.get<{
                value: number;
                metric_value: number;
            }>("/financial/earnings/total/");
            return response.data;
        },
    });

    const { data: amountPayment, isLoading: isLoadingAmountPayment } = useQuery({
        queryKey: ["amountPayment"],
        queryFn: fetchAmountPaymentReportService,
    });

    const generateCardIconAndStatus = (metricValue: number) => {
        if (metricValue < 1) {
            return {
                metricIcon: <ArrowDownOutlined />,
                status: "negative",
            };
        }
        if (metricValue > 1) {
            return {
                metricIcon: <ArrowUpOutlined />,
                status: "positive",
            };
        }

        return {
            metricIcon: <ArrowUpOutlined />,
            status: "neutral",
        };
    };

    const profit = (earningsGetTotal?.data || 0) - (amountPayment || 0);
    const isLoading = isLoadingEarningsGetTotal || isLoadingAmountPayment;

    const { data: paymentData, isLoading: isLoadingPayments } = useQuery({
        queryKey: ["paymentReport"],
        queryFn: fetchPaymentReportService,
    });

    const paymentChartData =
        paymentData?.payments.map((payment) => ({
            month: formatterMonthYearDate(payment.label),
            revenue: payment.credit,
            expenses: payment.debit,
        })) || [];

    const contextValue: DashboardContextData = {
        revenue: {
            ...earningsGetTotal,
            ...generateCardIconAndStatus(earningsGetTotal.metric_value),
            loading: isLoadingEarningsGetTotal,
            color: "green",
        },
        expenses: {
            value: amountPayment || 0,
            loading: isLoadingAmountPayment,
            color: "red",
            metricIcon: <ArrowDownOutlined />,
            metricValue: 3.2,
            status: "negative",
        },
        profit: {
            value: profit,
            loading: isLoading,
            color: "green",
            metricIcon: <ArrowUpOutlined />,
            metricValue: 12.5,
            status: "positive",
        },
        growth: {
            value: 25,
            loading: false,
            color: "#722ed1",
            metricIcon: <ArrowUpOutlined />,
            metricValue: 5.3,
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
