import { Line } from "react-chartjs-2";

import { formatterMonthYearDate } from "@/util/index";
import styles from "./paymentWithoutFixed.module.scss";
import { Theme } from "@/styles/theme";

export default function AccumulatedValue({
    amountForecastValue,
    payments,
    theme,
}: {
    payments: IPaymentCharts[];
    amountForecastValue: number;
    theme: Theme;
}) {
    const options = {
        responsive: true,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: "Acumulado de diferença entre debito e credito",
            },
        },
        scales: {
            y: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
            },
        },
    };

    const chartData = {
        labels: payments?.map((data) => formatterMonthYearDate(data.label)),
        datasets: [
            {
                label: "Total",
                data: payments?.map((data) => data.accumulated),
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
            {
                label: "Valor de reserva",
                data: payments?.map((data) => amountForecastValue),
                borderColor: "rgb(235, 53, 53)",
                backgroundColor: "rgba(235, 53, 53, 0.5)",
            },
        ],
    };

    return (
        <div className={styles["chart-container"]}>
            <Line
                data={chartData}
                options={options}
                width={400}
                height={200}
                style={{
                    background:
                        theme === "dark" ? "var(--color-theme-color-grey0)" : " var(--color-neutral-color-pure-white)",
                    paddingInline: "34px",
                    paddingBlock: "24px",
                    borderRadius: "20px",
                }}
            />
        </div>
    );
}
