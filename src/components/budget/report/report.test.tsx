import { render, screen } from "@testing-library/react";

import { useBudget } from "@/components/providers/budget";
import { formatMoney } from "@/util";
import dayjs from "dayjs";
import Report from ".";

jest.mock("@/components/providers/budget");
jest.mock("@/util", () => ({
    formatMoney: jest.fn((v) => `R$${v}`),
}));

describe("Report Component", () => {
    const mockChangePeriodFilter = jest.fn();

    const mockData = [
        {
            id: 1,
            name: "Alimentação",
            estimated_expense: 1000,
            actual_expense: 900,
        },
        {
            id: 2,
            name: "Transporte",
            estimated_expense: 500,
            actual_expense: 800,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        (useBudget as jest.Mock).mockReturnValue({
            changePeriodFilter: mockChangePeriodFilter,
            isLoading: false,
            data: mockData,
            periodFilter: dayjs("2024-10-01"),
        });
    });

    test("renderiza o título 'Resumo'", () => {
        render(<Report />);
        expect(screen.getByText("Resumo")).toBeInTheDocument();
    });

    test("renderiza os nomes dos orçamentos", () => {
        render(<Report />);

        expect(screen.getByText("Alimentação")).toBeInTheDocument();
        expect(screen.getByText("Transporte")).toBeInTheDocument();
    });

    test("formatMoney é chamado nas colunas 'Valor Gasto' e 'Devo Gastar'", () => {
        render(<Report />);

        expect(formatMoney).toHaveBeenCalledWith(900);
        expect(formatMoney).toHaveBeenCalledWith(800);
        expect(formatMoney).toHaveBeenCalledWith(1000);
        expect(formatMoney).toHaveBeenCalledWith(500);
    });

    test("coluna 'Valor Gasto' aplica classe positiva quando gasto <= estimado", () => {
        render(<Report />);

        const positiveCell = screen.getByText("R$900");
        expect(positiveCell.className).toContain("positive");
    });

    test("coluna 'Valor Gasto' aplica classe negativa quando gasto > estimado", () => {
        render(<Report />);

        const negativeCell = screen.getByText("R$800");
        expect(negativeCell.className).toContain("negative");
    });

    test("renderPercent mostra porcentagem positiva (<= 100%)", () => {
        render(<Report />);

        // 900 / 1000 = 0.9 → "90.00%"
        expect(screen.getByText("90.00%")).toBeInTheDocument();
    });

    test("renderPercent mostra porcentagem negativa (> 100%)", () => {
        render(<Report />);

        // 800 / 500 = 1.6 → "160.00%"
        expect(screen.getByText("160.00%")).toBeInTheDocument();
    });

    test("summary calcula totais corretamente", () => {
        render(<Report />);

        const totalExpense = 900 + 800; // 1700
        const totalEstimated = 1000 + 500; // 1500

        expect(screen.getByText(`R$${totalExpense}`)).toBeInTheDocument();
        expect(screen.getByText(`R$${totalEstimated}`)).toBeInTheDocument();

        // 1700 / 1500 = 1.13333 → 113.33%
        expect(screen.getByText("113.33%")).toBeInTheDocument();
    });

    test("summary aplica classe negativa quando gasto total > estimado total", () => {
        render(<Report />);

        const totalCell = screen.getByText("R$1700");

        expect(totalCell.className).toContain("negative");
    });
});
