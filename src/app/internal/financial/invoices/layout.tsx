"use client";
import { InvoicesProvider } from "@/components/providers/invoices";
import { PayoffProvider } from "@/components/providers/payoff";
import { SelectPaymentsProvider } from "@/components/providers/selectPayments";
import { TagsProvider } from "@/components/providers/tags";

const InvoiceslLayout = ({ children }: { children: React.ReactNode }) => (
    <TagsProvider>
        <SelectPaymentsProvider>
            <PayoffProvider>
                <InvoicesProvider
                    customDefaultFilters={{
                        fixed: false,
                        type: 1,
                        page: 1,
                        page_size: 10,
                    }}
                >
                    {children}
                </InvoicesProvider>
            </PayoffProvider>
        </SelectPaymentsProvider>
    </TagsProvider>
);

export default InvoiceslLayout;
