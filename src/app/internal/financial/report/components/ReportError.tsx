import { Alert } from "antd";

import { useReport } from "@/components/providers/report";

export function ReportError() {
    const { errorMessage } = useReport();

    if (!errorMessage) {
        return null;
    }

    return (
        <Alert
            type="error"
            showIcon
            message="Falha ao carregar relatorios financeiros"
            description={errorMessage}
            style={{ marginBottom: 16 }}
        />
    );
}
