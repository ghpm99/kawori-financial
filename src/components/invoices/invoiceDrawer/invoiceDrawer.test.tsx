import { render, screen, fireEvent, waitFor, findByRole, getByRole, within } from "@testing-library/react";
import InvoiceDrawer from ".";
import { ITags } from "@/components/providers/tags";
import { IInvoiceDetail } from "@/components/providers/invoices";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";

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
        invoiceDetail: undefined,
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

    describe("fixed behavior", () => {
        test("deve renderizar o campo false e habilitar caso fixed undefined", () => {
            render(<InvoiceDrawer {...defaultProps} isDefaultFixed={undefined} />);

            const fixedCheckbox = screen.getByRole("switch", { name: /fixo/i });
            expect(fixedCheckbox).toBeInTheDocument();
            expect(fixedCheckbox).toBeEnabled();
            expect(fixedCheckbox).toHaveAttribute("aria-checked", "false");
        });
        test("deve renderizar o campo true e desabilitar caso fixed true", () => {
            render(<InvoiceDrawer {...defaultProps} isDefaultFixed={true} />);

            const fixedCheckbox = screen.getByRole("switch", { name: /fixo/i });
            expect(fixedCheckbox).toBeInTheDocument();
            expect(fixedCheckbox).not.toBeEnabled();
            expect(fixedCheckbox).toHaveAttribute("aria-checked", "true");
        });
        test("deve renderizar o campo false e desabilitar caso fixed false", () => {
            render(<InvoiceDrawer {...defaultProps} isDefaultFixed={false} />);

            const fixedCheckbox = screen.getByRole("switch", { name: /fixo/i });
            expect(fixedCheckbox).toBeInTheDocument();
            expect(fixedCheckbox).not.toBeEnabled();
            expect(fixedCheckbox).toHaveAttribute("aria-checked", "false");
        });
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
                tags: [
                    {
                        color: "red",
                        id: 1,
                        is_budget: true,
                        label: "Orçamento",
                        name: "Orçamento",
                        total_closed: 0,
                        total_open: 0,
                        total_payments: 0,
                        total_value: 0,
                        value: 1,
                    },
                ],
                status: 0,
                active: true,
            }),
        );
    });

    test("preenche o formulario e cria nova nota", async () => {
        const onCreate = jest.fn();

        render(<InvoiceDrawer {...defaultProps} onCreateNewInvoice={onCreate} />);
        const user = userEvent.setup();

        const tagNameElement = screen.getByRole("textbox", { name: /nome/i });
        await user.type(tagNameElement, "teste nota");

        const dateInput = screen.getByRole("textbox", { name: /dia de lançamento/i });
        await user.clear(dateInput);
        await user.type(dateInput, "01/02/2024");

        const paymentDateInput = screen.getByRole("textbox", { name: /dia de pagamento/i });
        await user.clear(paymentDateInput);
        await user.type(paymentDateInput, "02/02/2024");

        const installments = screen.getByRole("spinbutton", { name: /parcelas/i });
        await user.type(installments, "3");

        const valueInput = screen.getByRole("spinbutton", { name: /valor/i });
        await user.type(valueInput, "1234");

        const tagSelect = screen.getByRole("combobox", { name: /etiquetas/i });
        fireEvent.mouseDown(tagSelect);

        const tagOption = await screen.findAllByText(/comida/i);
        tagOption[0].click();

        const tagBudgetOption = await screen.findAllByText(/orçamento/i);
        tagBudgetOption[0].click();

        fireEvent.click(screen.getByText("Salvar"));

        await waitFor(() =>
            expect(onCreate).toHaveBeenCalledWith({
                id: 0,
                name: "teste nota",
                value: 12.34,
                date: "2024-02-01",
                fixed: false,
                next_payment: "2024-02-02",
                installments: 13,
                tags: [
                    {
                        color: "red",
                        id: 1,
                        is_budget: true,
                        label: "Orçamento",
                        name: "Orçamento",
                        total_closed: 0,
                        total_open: 0,
                        total_payments: 0,
                        total_value: 0,
                        value: 1,
                    },
                    {
                        color: "green",
                        id: 2,
                        is_budget: false,
                        label: "Comida",
                        name: "Comida",
                        total_closed: 0,
                        total_open: 0,
                        total_payments: 0,
                        total_value: 0,
                        value: 2,
                    },
                ],
                status: 0,
                active: true,
            }),
        );
    });
});
