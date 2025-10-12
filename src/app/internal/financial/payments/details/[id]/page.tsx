"use client";
import { Breadcrumb, Button, Card, Checkbox, DatePicker, InputNumber, Layout, message, Select, Typography } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import dayjs from "dayjs";

import Link from "next/link";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import LoadingPage from "@/components/loadingPage/Index";
import { payoffPaymentService, savePaymentDetailService } from "@/services/financial";

import { setSelectedMenu } from "@/lib/features/auth";
import {
    changeActivePaymentDetails,
    changeFixedPaymentDetails,
    changeNamePaymentDetails,
    changePaymentDatePaymentDetails,
    changeStatusPaymentDetails,
    changeTypePaymentDetails,
    changeValuePaymentDetails,
    fetchPaymentDetails,
} from "@/lib/features/financial/payment/detail";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import styles from "./Details.module.scss";

const { Paragraph } = Typography;
const { Option } = Select;

export default function PaymentDetails({ params }: { params: { id: number } }) {
    const msgRef = "payment-details-msg";

    const { id } = params;

    const financialStore = useSelector((state: RootState) => state.financial.paymentDetail);
    const dispatch = useAppDispatch();

    useEffect(() => {
        document.title = `Kawori Pagamento ${id}`;
        dispatch(setSelectedMenu(["financial", "payments"]));
    }, []);

    useEffect(() => {
        if (id) {
            const idPayment = id;
            dispatch(fetchPaymentDetails(idPayment));
        }
    }, [id]);

    const date = new Date(financialStore.data?.date).toLocaleDateString();

    const save = () => {
        savePaymentDetailService(financialStore.data.id, financialStore.data).then((response) => {
            message.success({
                content: response.msg,
                key: msgRef,
            });
        });
    };

    const changeName = (event: string) => {
        dispatch(changeNamePaymentDetails(event));
    };

    const changeType = (event: number) => {
        dispatch(changeTypePaymentDetails(event));
    };

    const changeFixed = (event: CheckboxChangeEvent) => {
        const { checked } = event.target;
        dispatch(changeFixedPaymentDetails(checked));
    };

    const changeActive = (event: CheckboxChangeEvent) => {
        const { checked } = event.target;
        dispatch(changeActivePaymentDetails(checked));
    };

    const changePaymentDate = (date: any) => {
        dispatch(changePaymentDatePaymentDetails(date.format("YYYY-MM-DD")));
    };

    const changeValue = (event: number | null) => {
        if (!event) {
            return;
        }
        dispatch(changeValuePaymentDetails(event));
    };

    const payoff = () => {
        payoffPaymentService(financialStore.data.id).then((data) => {
            message.success({
                content: data.msg,
                key: msgRef,
            });
            dispatch(changeStatusPaymentDetails(1));
        });
    };

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Pagamento</Breadcrumb.Item>
                <Breadcrumb.Item>Detalhes</Breadcrumb.Item>
            </Breadcrumb>

            <Card loading={financialStore.loading}>
                <div className={styles["row"]}>
                    <div className={styles["label-detail"]}>
                        <div className={styles["label"]}>ID: {financialStore.data?.id}</div>
                    </div>
                    <div className={styles["label-detail"]}>
                        <Link href={`/admin/financial/contracts/details/${financialStore.data?.contract}`}>
                            <div className={styles["label"]} style={{ cursor: "pointer" }}>
                                Contrato: {`${financialStore.data?.contract} - ${financialStore.data?.contract_name}`}
                            </div>
                        </Link>
                    </div>
                    <div className={styles["label-detail"]}>
                        <Link href={`/admin/financial/invoices/details/${financialStore.data?.invoice}`}>
                            <div className={styles["label"]} style={{ cursor: "pointer" }}>
                                Nota: {`${financialStore.data?.invoice} - ${financialStore.data?.invoice_name}`}
                            </div>
                        </Link>
                    </div>
                </div>
                <div className={styles["row"]}>
                    <div className={styles["label-detail"]}>
                        <div className={styles.label}>Nome:</div>
                        <Paragraph style={{ margin: "0" }} editable={{ onChange: changeName }}>
                            {financialStore.data?.name}
                        </Paragraph>
                    </div>
                    <div className={styles["label-detail"]}>
                        <div className={styles.label}>Dia de lançamento:</div>
                        <div>{date}</div>
                    </div>
                    <div className={styles["label-detail"]}>
                        <div className={styles.label}>Dia de pagamento:</div>
                        <DatePicker
                            value={dayjs(financialStore.data?.payment_date)}
                            format="DD/MM/YYYY"
                            onChange={changePaymentDate}
                        />
                    </div>
                </div>
                <div className={styles["row"]}>
                    <div className={styles["label-detail"]}>
                        <div className={styles.label}>Status:</div>
                        <div>{financialStore.data?.status === 0 ? "Em aberto" : "Baixado"}</div>
                    </div>
                    <div className={styles["label-detail"]}>
                        <div className={styles.label}>Tipo:</div>
                        <Select
                            placeholder="Selecione o tipo de entrada"
                            value={financialStore.data?.type}
                            onChange={changeType}
                        >
                            <Option value={0}>Credito</Option>
                            <Option value={1}>Debito</Option>
                        </Select>
                    </div>
                    <div className={styles["label-detail"]}>
                        <div className={styles.label}>Parcelas:</div>
                        <div>{financialStore.data?.installments}</div>
                    </div>
                </div>
                <div className={styles["row"]}>
                    <div className={styles["label-detail"]}>
                        <div className={styles.label}>Valor:</div>
                        <InputNumber value={financialStore.data?.value} onChange={changeValue} />
                    </div>
                    <div className={styles["label-detail"]}>
                        <div>
                            <Checkbox checked={financialStore.data?.fixed} onChange={changeFixed}>
                                Fixo
                            </Checkbox>
                        </div>
                    </div>
                    <div className={styles["label-detail"]}>
                        <div>
                            <Checkbox checked={financialStore.data?.active} onChange={changeActive}>
                                Ativo
                            </Checkbox>
                        </div>
                    </div>
                </div>
                <div className={styles.buttons}>
                    {financialStore.data?.status === 0 ? (
                        <Button danger type="default" onClick={payoff}>
                            Baixar pagamento
                        </Button>
                    ) : (
                        <></>
                    )}
                    <Button type="primary" onClick={save} className={styles.button_save}>
                        Salvar
                    </Button>
                </div>
            </Card>
        </>
    );
}

PaymentDetails.auth = {
    role: "admin",
    loading: <LoadingPage />,
    unauthorized: "/signin",
};
