import { Card } from "antd";

import { formatMoney } from "@/util/index";
import styles from "./cards.module.scss";

interface ICardsProps {
    loading: boolean;
    countPayment: number;
    amountPayment: number;
    amountPaymentOpen: number;
    amountPaymentClosed: number;
}

const Cards = (props: ICardsProps) => {
    return (
        <div className={styles["cards-container"]}>
            <Card title="Total de pagamentos" style={{ flexGrow: "1" }} loading={props.loading}>
                <div data-testid="countPayment">{props.countPayment}</div>
            </Card>
            <Card title="Valor total de pagamentos" style={{ flexGrow: "1" }} loading={props.loading}>
                <div data-testid="amountPayment">{formatMoney(props.amountPayment)}</div>
            </Card>
            <Card title="Valor total de pagamentos em aberto" style={{ flexGrow: "1" }} loading={props.loading}>
                <div data-testid="amountPaymentOpen">{formatMoney(props.amountPaymentOpen)}</div>
            </Card>
            <Card title="Valor total de pagamentos fechados" style={{ flexGrow: "1" }} loading={props.loading}>
                <div data-testid="amountPaymentClosed">{formatMoney(props.amountPaymentClosed)}</div>
            </Card>
        </div>
    );
};

export default Cards;
