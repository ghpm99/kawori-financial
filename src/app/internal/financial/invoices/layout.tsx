"use client";
import { InvoicesProvider } from "@/components/providers/invoices";
import { PayoffProvider } from "@/components/providers/payoff";
import { SelectPaymentsProvider } from "@/components/providers/selectPayments";
import { TagsProvider } from "@/components/providers/tags";

const InvoiceslLayout = ({ children }: { children: React.ReactNode }) => (
    <TagsProvider>
        <SelectPaymentsProvider>
            <PayoffProvider>
                <InvoicesProvider>
                    <PayoffProvider>{children}</PayoffProvider>
                </InvoicesProvider>
            </PayoffProvider>
        </SelectPaymentsProvider>
    </TagsProvider>
);

export default InvoiceslLayout;
