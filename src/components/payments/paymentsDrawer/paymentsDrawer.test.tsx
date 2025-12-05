import { IPaymentDetail } from "@/components/providers/payments";
import { fakerPT_BR as faker } from "@faker-js/faker";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PaymentsDrawer from ".";
import userEvent from "@testing-library/user-event";

describe("PaymentsDrawer", () => {
    const paymentDetail: IPaymentDetail = {
        id: faker.number.int({ min: 1, max: 1000 }),
        status: faker.number.int({ min: 0, max: 1 }),
        type: faker.number.int({ min: 0, max: 1 }),
        name: `Pagamento ${faker.company.buzzPhrase()}`,
        date: faker.date.past().toISOString().split("T")[0],
        installments: faker.number.int({ min: 1, max: 12 }),
        payment_date: faker.date.future().toISOString().split("T")[0],
        fixed: false,
        active: true,
        value: parseFloat(faker.finance.amount({ dec: 2 })),
        invoice: faker.number.int({ min: 1, max: 100 }),
        invoice_name: `FAT-${faker.number.int({ min: 1000, max: 9999 })}`,
    };

    const defaultProps = {
        open: true,
        onClose: jest.fn(),
        paymentDetail: undefined,
        isLoading: false,
        onUpdatePaymentDetail: jest.fn(),
    };

    test("renderiza drawer de nova nota quando não há paymentDetail", () => {
        render(<PaymentsDrawer {...defaultProps} />);
        expect(screen.getByText("Novo Pagamento")).toBeInTheDocument();
        expect(screen.getByText("Salvar")).toBeInTheDocument();
    });

    test("renderiza drawer em modo edição quando paymentDetail é enviado", () => {
        render(<PaymentsDrawer {...defaultProps} paymentDetail={paymentDetail} />);

        expect(screen.getByText(`Pagamento #${paymentDetail.id}`)).toBeInTheDocument();
        expect(screen.getByText("Salvar")).toBeInTheDocument();
    });

    test("preenche o formulário com dados de pagamento no modo edição", async () => {
        render(<PaymentsDrawer {...defaultProps} paymentDetail={paymentDetail} />);

        expect(screen.getByDisplayValue(paymentDetail.name)).toBeInTheDocument();
        expect(await screen.findByText(paymentDetail.invoice_name)).toBeInTheDocument();
    });

    test("deve preencher o formulario corretamente", async () => {
        const paymentDetailCustom = {
            ...paymentDetail,
            date: "2025-12-04",
            payment_date: "2025-12-03",
            status: 0,
            type: 0,
            value: 12345.67,
            fixed: false,
            active: false,
        };
        const { rerender } = render(<PaymentsDrawer {...defaultProps} paymentDetail={paymentDetailCustom} />);

        expect(await screen.findByDisplayValue("04/12/2025")).toBeInTheDocument();
        expect(await screen.findByDisplayValue("03/12/2025")).toBeInTheDocument();
        expect(await screen.findByText("Em aberto")).toBeInTheDocument();
        expect(await screen.findByText("Credito")).toBeInTheDocument();
        expect(await screen.findByDisplayValue("R$ 12.345,67")).toBeInTheDocument();

        const fixedCheckbox = screen.getByRole("switch", { name: /fixo/i });
        expect(fixedCheckbox).toHaveAttribute("aria-checked", "false");

        const activeInput = screen.getByRole("switch", { name: /ativo/i });
        expect(activeInput).toHaveAttribute("aria-checked", "false");
        rerender(
            <PaymentsDrawer
                {...defaultProps}
                paymentDetail={{ ...paymentDetailCustom, status: 1, type: 1, fixed: true, active: true }}
            />,
        );
        expect(await screen.findByText("Baixado")).toBeInTheDocument();
        expect(await screen.findByText("Debito")).toBeInTheDocument();

        expect(fixedCheckbox).toHaveAttribute("aria-checked", "true");
        expect(activeInput).toHaveAttribute("aria-checked", "true");
    });

    test("salva edição chamando onUpdatePaymentDetail", async () => {
        const onUpdate = jest.fn();

        render(<PaymentsDrawer {...defaultProps} paymentDetail={paymentDetail} onUpdatePaymentDetail={onUpdate} />);

        fireEvent.click(screen.getByText("Salvar"));

        await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(paymentDetail));
    });

    test("edita o pagamento e salva", async () => {
        const onUpdate = jest.fn();

        render(
            <PaymentsDrawer
                {...defaultProps}
                paymentDetail={{ ...paymentDetail, status: 0 }}
                onUpdatePaymentDetail={onUpdate}
            />,
        );
        const user = userEvent.setup();

        const newName = faker.company.buzzPhrase();
        const paymentNameInput = screen.getByRole("textbox", { name: /nome/i });
        await user.clear(paymentNameInput);
        await user.type(paymentNameInput, newName);

        const paymentDateInput = screen.getByRole("textbox", { name: /dia de pagamento/i });
        await user.clear(paymentDateInput);
        await user.type(paymentDateInput, "02/02/2024");

        const newValue = faker.finance.amount({ dec: 2 });
        const valueInput = screen.getByRole("spinbutton", { name: /valor/i });
        await user.clear(valueInput);
        await user.type(valueInput, newValue);

        const fixedInput = screen.getByRole("switch", { name: /fixo/i });
        fireEvent.click(fixedInput);

        const activeInput = screen.getByRole("switch", { name: /ativo/i });
        fireEvent.click(activeInput);

        fireEvent.click(screen.getByText("Salvar"));

        await waitFor(() =>
            expect(onUpdate).toHaveBeenCalledWith({
                ...paymentDetail,
                status: 0,
                name: newName,
                payment_date: "2024-02-02",
                value: parseFloat(newValue),
                fixed: true,
                active: false,
            }),
        );
    });
});
