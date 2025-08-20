import { Bar } from "react-chartjs-2";
import styles from "./paymentFixed.module.scss";
import { Theme } from "@/styles/theme";

export default function PaymentFixed({
    fixedCredit,
    fixedDebit,
    theme,
}: {
    fixedCredit: number;
    fixedDebit: number;
    theme: Theme;
}) {
    const labels = ["Ativo"];

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Relatorio pagamentos mensais",
            },
        },
    };

    const data = {
        labels,
        datasets: [
            {
                label: "Credito",
                data: [fixedCredit],
                backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
            {
                label: "Debito",
                data: [fixedDebit],
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
        ],
    };

    return (
        <div className={styles["chart-container"]}>
            <Bar
                data={data}
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
