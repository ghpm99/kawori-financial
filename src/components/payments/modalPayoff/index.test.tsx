import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("antd", () => ({
    Modal: ({ title, footer, children }: { title: React.ReactNode; footer: React.ReactNode; children: React.ReactNode }) => (
        <div>
            <div>{title}</div>
            <div data-testid="modal-footer">{footer}</div>
            {children}
        </div>
    ),
    Progress: ({ percent }: { percent: number }) => <div data-testid="progress">{percent}</div>,
    Table: ({ dataSource, columns }: { dataSource: Array<{ status: string; name: string; description: string }>; columns: Array<{ title: string; render?: (value: string) => React.ReactNode; dataIndex?: string }> }) => (
        <div>
            {dataSource.map((row, idx) => (
                <div key={idx}>
                    <span>{row.name}</span>
                    <span>{row.description}</span>
                    {columns[2]?.render?.(row.status)}
                </div>
            ))}
        </div>
    ),
    Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

import ModalPayoff from "./index";

describe("ModalPayoff", () => {
    test("renderiza modo processamento com botoes Voltar/Processar", () => {
        const onCancel = jest.fn();
        const onPayoff = jest.fn();

        render(
            <ModalPayoff
                visible={true}
                onCancel={onCancel}
                onPayoff={onPayoff}
                percent={50}
                percentFailed={10}
                progressText="andamento"
                completed={false}
                processing={false}
                data={[
                    { id: 1, name: "Pagamento 1", description: "Aguardando", status: "pending" },
                    { id: 2, name: "Pagamento 2", description: "Concluido", status: "completed" },
                    { id: 3, name: "Pagamento 3", description: "Falhou", status: "failed" },
                ]}
            />,
        );

        expect(screen.getByText("Baixar pagamentos")).toBeInTheDocument();
        expect(screen.getByTestId("progress")).toHaveTextContent("50");
        expect(screen.getByText("andamento")).toBeInTheDocument();
        expect(screen.getByText("Voltar")).toBeInTheDocument();
        expect(screen.getByText("Processar")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Voltar"));
        fireEvent.click(screen.getByText("Processar"));
        expect(onCancel).toHaveBeenCalled();
        expect(onPayoff).toHaveBeenCalled();
    });

    test("renderiza modo concluido com botao Fechar", () => {
        const onCancel = jest.fn();
        render(
            <ModalPayoff
                visible={true}
                onCancel={onCancel}
                onPayoff={jest.fn()}
                percent={100}
                percentFailed={0}
                progressText="finalizado"
                completed={true}
                processing={false}
                data={[{ id: 1, name: "Pagamento", description: "Cancelado", status: "cancelled" }]}
            />,
        );

        expect(screen.getByText("Fechar")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Fechar"));
        expect(onCancel).toHaveBeenCalled();
    });
});
