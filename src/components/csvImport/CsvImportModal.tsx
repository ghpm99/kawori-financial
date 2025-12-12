"use client";

import { CheckOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Modal, Steps } from "antd";

import ConfirmStep from "./steps/ConfirmStep";
import MappingStep from "./steps/MappingStep";
import PreviewStep from "./steps/PreviewStep";
import ReconciliationStep from "./steps/ReconciliationStep";
import UploadStep from "./steps/UploadStep";

import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FIRST_STEP, useCsvImportProvider } from "../providers/csvImport";
import styles from "./csvImport.module.scss";
import SelectTypeStep from "./steps/SelectTypeStep";

export default function CsvImportModal() {
    const {
        step,
        steps,
        currentStepIndex,
        goToPreviousStep,
        handleCloseModal,
        openModal,
        processTransactions,
        isProcessing,
        stats,
        handleImport,
        goToStep,
    } = useCsvImportProvider();

    return (
        <Modal open={openModal} onCancel={handleCloseModal} footer={null} width={960}>
            <div className={styles.wrapper}>
                <div className={styles.header} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <FontAwesomeIcon icon={faFileCsv} />
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Importar Transações via CSV</div>
                    </div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>
                        Importe faturas ou movimentações bancárias de um arquivo CSV.
                    </div>
                </div>

                <div className={styles.stepsRow}>
                    <Steps
                        current={currentStepIndex}
                        size="small"
                        items={steps.map((s) => ({ key: s.key, title: s.title, icon: s.icon }))}
                    />
                </div>

                <div className={styles.content}>
                    {step === "type" && <SelectTypeStep />}
                    {step === "upload" && <UploadStep />}
                    {step === "mapping" && <MappingStep />}
                    {step === "preview" && <PreviewStep />}
                    {step === "reconciliation" && <ReconciliationStep />}
                    {step === "confirm" && <ConfirmStep />}
                </div>

                {step !== "confirm" && (
                    <div className={styles.footer}>
                        <div>
                            <Button onClick={goToPreviousStep}>
                                <LeftOutlined /> {step === FIRST_STEP ? "Cancelar" : "Voltar"}
                            </Button>
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {step === "preview" && (
                                <div style={{ color: "var(--ant-text-color-secondary)" }}>
                                    {stats.toImport} transações serão importadas
                                </div>
                            )}

                            {step === "mapping" && (
                                <Button type="primary" onClick={processTransactions} disabled={isProcessing}>
                                    Processar dados <RightOutlined />
                                </Button>
                            )}

                            {step === "preview" && (
                                <Button type="primary" onClick={() => goToStep("reconciliation")}>
                                    Reconciliar <RightOutlined />
                                </Button>
                            )}

                            {step === "reconciliation" && (
                                <Button type="primary" disabled={stats.toImport === 0} onClick={handleImport}>
                                    Importar {stats.toImport} transações <CheckOutlined />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
