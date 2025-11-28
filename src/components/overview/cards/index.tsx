import { Card } from "antd";

import { formatMoney } from "@/util/index";

import styles from "./cards.module.scss";
import { useReport } from "@/components/providers/report";

const Cards = () => {
    const { countPayment, amountPayment, amountPaymentOpen, amountPaymentClosed } = useReport();

    return (
        <div className={styles["cards-container"]}>
            <Card title="Total de pagamentos" style={{ flexGrow: "1" }} loading={countPayment.isLoading}>
                <div data-testid="countPayment">{countPayment.data}</div>
            </Card>
            <Card title="Valor total de pagamentos" style={{ flexGrow: "1" }} loading={amountPayment.isLoading}>
                <div data-testid="amountPayment">{formatMoney(amountPayment.data)}</div>
            </Card>
            <Card
                title="Valor total de pagamentos em aberto"
                style={{ flexGrow: "1" }}
                loading={amountPaymentOpen.isLoading}
            >
                <div data-testid="amountPaymentOpen">{formatMoney(amountPaymentOpen.data)}</div>
            </Card>
            <Card
                title="Valor total de pagamentos fechados"
                style={{ flexGrow: "1" }}
                loading={amountPaymentClosed.isLoading}
            >
                <div data-testid="amountPaymentClosed">{formatMoney(amountPaymentClosed.data)}</div>
            </Card>
        </div>
    );
};

export default Cards;
