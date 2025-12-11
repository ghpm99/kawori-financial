"use client";

import { Modal } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowsRotate,
    faCheck,
    faChevronRight,
    faFileLines,
    faLink,
    faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import styles from "./csvImport.module.scss";

type ImportStep = "upload" | "mapping" | "preview" | "reconciliation" | "confirm";

interface ICSVImportModalProps {
    open: boolean;
}
const CSVImportModal = ({ open }: ICSVImportModalProps) => {
    const [step, setStep] = useState<ImportStep>("upload");

    const steps: { key: ImportStep; label: string; icon: React.ReactNode }[] = [
        { key: "upload", label: "Upload", icon: <FontAwesomeIcon icon={faUpload} /> },
        { key: "mapping", label: "Mapeamento", icon: <FontAwesomeIcon icon={faLink} /> },
        { key: "preview", label: "Preview", icon: <FontAwesomeIcon icon={faFileLines} /> },
        { key: "reconciliation", label: "Reconciliação", icon: <FontAwesomeIcon icon={faArrowsRotate} /> },
        { key: "confirm", label: "Confirmar", icon: <FontAwesomeIcon icon={faCheck} /> },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === step);

    return (
        <Modal
            open={open}
            centered
            title="Importar Transações via CSV"
            width={{
                xs: "90%",
                sm: "80%",
                md: "70%",
                lg: "60%",
                xl: "50%",
                xxl: "40%",
            }}
        >
            <div>Importe faturas ou movimentações bancárias de um arquivo CSV e vincule com pagamentos existentes.</div>
            <div className={styles["step-list"]}>
                {steps.map((s, index) => (
                    <div key={s.key} className={styles["step-container"]}>
                        <div
                            className={`${styles["step"]} ${index === currentStepIndex ? styles["current-step"] : index < currentStepIndex ? styles["checked-step"] : styles["next-step"]}`}
                        >
                            {index < currentStepIndex ? <FontAwesomeIcon icon={faCheck} /> : s.icon}
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <FontAwesomeIcon className={styles["chevron-icon"]} icon={faChevronRight} />
                        )}
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default CSVImportModal;
