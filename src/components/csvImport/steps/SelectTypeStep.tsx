import { Alert, Card, Col, DatePicker, Row, Typography } from "antd";

import { faCreditCard, faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useCsvImportProvider } from "@/components/providers/csvImport";
import { useState } from "react";
import styles from "./steps.module.scss";

const { Title, Paragraph } = Typography;

export default function SelectTypeStep() {
    const { handleSelectImportType, paymentDate, setPaymentDate } = useCsvImportProvider();
    const [errorMessage, setErrorMessage] = useState("");

    console.log(paymentDate);
    console.log(errorMessage);
    const handleSelectCardImport = () => {
        console.log("handleSelectCardImport", paymentDate);
        if (!paymentDate) {
            setErrorMessage("Selecione uma data de pagamento");
            return;
        }
        setErrorMessage("");
        handleSelectImportType("card_payments");
    };
    return (
        <div className={styles.container}>
            <Title level={4} className={styles.title}>
                O que você deseja importar?
            </Title>

            <Paragraph className={styles.subtitle}>
                Selecione o tipo de arquivo CSV que você exportou do Nubank. Isso garante que o processamento funcione
                corretamente.
            </Paragraph>

            <Row gutter={[24, 24]}>
                {/* MOVIMENTAÇÕES */}
                <Col xs={24} md={12}>
                    <Card hoverable className={styles.card} onClick={() => handleSelectImportType("transactions")}>
                        <div className={styles.iconWrapper}>
                            <FontAwesomeIcon icon={faMoneyBillTransfer} className={styles.icon} />
                        </div>

                        <Title level={5}>Movimentações da Conta</Title>

                        <Paragraph type="secondary">
                            CSV exportado em:
                            <br />
                            <strong>Conta → Histórico → Exportar extrato (CSV)</strong>
                            <br />
                            Contém: Pix, entradas, saídas, transferências, pagamento da fatura, rendimentos, compras no
                            débito e muito mais.
                        </Paragraph>
                    </Card>
                </Col>

                {/* FATURAS */}
                <Col xs={24} md={12}>
                    <Card hoverable className={styles.card} onClick={() => handleSelectCardImport()}>
                        <div className={styles.iconWrapper}>
                            <FontAwesomeIcon icon={faCreditCard} className={styles.icon} />
                        </div>

                        <Title level={5}>Faturas Fechadas do Cartão</Title>

                        <Paragraph type="secondary">
                            CSV exportado em:
                            <br />
                            <strong>Cartão → Fatura → Exportar compras (CSV)</strong>
                            <br />
                            Contém: compras, parcelamentos, IOF, juros e apenas{" "}
                            <strong>saídas relacionadas ao cartão de crédito</strong>.
                        </Paragraph>
                        <Paragraph type="warning">
                            Dia de pagamento da fatura:
                            <DatePicker
                                variant="underlined"
                                placeholder="Selecione a data de pagamento"
                                style={{ width: "100%" }}
                                format={"DD/MM/YYYY"}
                                value={paymentDate}
                                onChange={setPaymentDate}
                            />
                            {errorMessage && <Alert title={errorMessage} type="error" />}
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
