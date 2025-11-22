"use client";

import { InvoicesProvider } from "@/components/providers/invoices";
import { PayoffProvider } from "@/components/providers/payoff";
import { SelectPaymentsProvider } from "@/components/providers/selectPayments";
import { TagsProvider } from "@/components/providers/tags";

const EarningsLayout = ({ children }: { children: React.ReactNode }) => (
    <TagsProvider>
        <SelectPaymentsProvider>
            <PayoffProvider>
                <InvoicesProvider
                    customDefaultFilters={{
                        type: 0,
                        page: 1,
                        page_size: 10,
                    }}
                >
                    <PayoffProvider>{children}</PayoffProvider>
                </InvoicesProvider>
            </PayoffProvider>
        </SelectPaymentsProvider>
    </TagsProvider>
);

export default EarningsLayout;
