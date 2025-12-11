import { Card, Typography, Row, Col } from "antd";
import { CreditCardOutlined, SwapOutlined } from "@ant-design/icons";

import styles from "./steps.module.scss";
import { ImportType } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";

const { Title, Paragraph } = Typography;

interface SelectTypeStepProps {
    onSelect: (type: ImportType) => void;
}

export default function SelectTypeStep({ onSelect }: SelectTypeStepProps) {
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
                    <Card hoverable className={styles.card} onClick={() => onSelect("transactions")}>
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
                    <Card hoverable className={styles.card} onClick={() => onSelect("invoices")}>
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
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
