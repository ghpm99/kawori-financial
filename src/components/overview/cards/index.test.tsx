import Cards from "@/components/overview/cards";
import { formatMoney } from "@/util/index";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

describe("Overview Card", () => {
    test("Render overview card", () => {
        const { baseElement } = render(
            <Cards
                loading={false}
                amountPayment={1508.15}
                amountPaymentClosed={2718.15}
                amountPaymentOpen={1508.15}
                countPayment={1508.15}
            />,
        );
        expect(baseElement).toBeInTheDocument();
    });
    test("Verify render values", () => {
        const amountPayment = 1508.52;
        const amountPaymentClosed = 2718.72;
        const amountPaymentOpen = 3481.75;
        const countPayment = 487;
        const { getByTestId } = render(
            <Cards
                loading={false}
                amountPayment={amountPayment}
                amountPaymentClosed={amountPaymentClosed}
                amountPaymentOpen={amountPaymentOpen}
                countPayment={countPayment}
            />,
        );
        const countPaymentText = getByTestId("countPayment").textContent;
        expect(countPaymentText).not.toBeNull();
        expect(parseInt(countPaymentText ?? "")).toBe(countPayment);

        const amountPaymentText = getByTestId("amountPayment").textContent;
        expect(amountPaymentText).not.toBeNull();
        expect(amountPaymentText).toBe(formatMoney(amountPayment));

        const amountPaymentClosedText = getByTestId("amountPaymentClosed").textContent;
        expect(amountPaymentClosedText).not.toBeNull();
        expect(amountPaymentClosedText).toBe(formatMoney(amountPaymentClosed));

        const amountPaymentOpenText = getByTestId("amountPaymentOpen").textContent;
        expect(amountPaymentOpenText).not.toBeNull();
        expect(amountPaymentOpenText).toBe(formatMoney(amountPaymentOpen));
    });
});
