import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InvoiceDrawer from ".";
import { ITags } from "@/components/providers/tags";
import { IInvoiceDetail } from "@/components/providers/invoices";

// Mock simples do InvoicePayments
jest.mock("../payments", () => ({
    InvoicePayments: () => <div data-testid="invoice-payments" />,
}));

describe("InvoiceDrawer", () => {
    const tagsData: ITags[] = [
        {
            id: 1,
            name: "Orçamento",
            color: "red",
            is_budget: true,
            total_closed: 0,
            total_open: 0,
            total_value: 0,
            total_payments: 0,
        },
        {
            id: 2,
            name: "Comida",
            color: "green",
            is_budget: false,
            total_closed: 0,
            total_open: 0,
            total_value: 0,
            total_payments: 0,
        },
    ];

    const invoiceDetail: IInvoiceDetail = {
        id: 10,
        name: "Conta de Luz",
        value: 150.0,
        date: "2024-02-01",
        next_payment: "2024-02-15",
        installments: 1,
        tags: [
            {
                id: 1,
                name: "Orçamento",
                color: "red",
                is_budget: true,
                total_closed: 0,
                total_open: 0,
                total_value: 0,
                total_payments: 0,
            },
        ],
        status: 0,
        active: true,
        value_open: 150.0,
        value_closed: 0,
    };

    const defaultProps = {
        open: true,
        onClose: jest.fn(),
        invoiceDetail: { undefined },
        isLoading: false,
        onUpdateInvoiceDetail: jest.fn(),
        onCreateNewInvoice: jest.fn(),
        tags_data: tagsData,
        isLoadingTags: false,
    };

    test("renderiza drawer de nova nota quando não há invoiceDetail", () => {
        render(<InvoiceDrawer {...defaultProps} invoiceDetail={undefined} />);

        expect(screen.getByText("Nova nota")).toBeInTheDocument();
        expect(screen.getByText("Salvar")).toBeInTheDocument();
    });

    test("renderiza drawer em modo edição quando invoiceDetail é enviado", () => {
        render(<InvoiceDrawer {...defaultProps} invoiceDetail={invoiceDetail} />);

        expect(screen.getByText("Nota #10")).toBeInTheDocument();
        expect(screen.getByTestId("invoice-payments")).toBeInTheDocument();
    });

    test("preenche o formulário com dados da nota no modo edição", () => {
        render(<InvoiceDrawer {...defaultProps} invoiceDetail={invoiceDetail} />);

        expect(screen.getByDisplayValue("Conta de Luz")).toBeInTheDocument();
        expect(screen.getByDisplayValue("1")).toBeInTheDocument(); // installments
    });

    test("aciona onClose ao clicar em cancelar", () => {
        const onClose = jest.fn();

        render(<InvoiceDrawer {...defaultProps} onClose={onClose} invoiceDetail={undefined} />);

        fireEvent.click(screen.getByText("Cancelar"));

        expect(onClose).toHaveBeenCalled();
    });

    test("salva nova nota chamando onCreateNewInvoice", async () => {
        const onCreate = jest.fn();

        render(
            <InvoiceDrawer
                {...defaultProps}
                invoiceDetail={{
                    id: 0,
                    name: "teste",
                    value: 100,
                    date: "2024-02-01",
                    next_payment: "2024-02-15",
                    installments: 1,
                    tags: [tagsData[0]],
                    status: 0,
                    active: true,
                    value_open: 0,
                    value_closed: 0,
                }}
                onCreateNewInvoice={onCreate}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText("Entre com o nome da nota"), {
            target: { value: "Nova Despesa" },
        });

        fireEvent.click(screen.getByText("Salvar"));

        await waitFor(() => expect(onCreate).toHaveBeenCalled());
    });

    test("salva edição chamando onUpdateInvoiceDetail", async () => {
        const onUpdate = jest.fn();

        render(<InvoiceDrawer {...defaultProps} invoiceDetail={invoiceDetail} onUpdateInvoiceDetail={onUpdate} />);

        fireEvent.click(screen.getByText("Salvar"));

        await waitFor(() =>
            expect(onUpdate).toHaveBeenCalledWith({
                id: 10,
                name: "Conta de Luz",
                value: 150.0,
                date: "2024-02-01",
                fixed: undefined,
                next_payment: "2024-02-15",
                installments: 1,
                tags: ["Orçamento"],
                status: 0,
                active: true,
            }),
        );
    });
});
