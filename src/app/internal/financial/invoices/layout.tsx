"use client";
import { InvoicesProvider } from "@/components/providers/invoices";
import { PaymentsProvider } from "@/components/providers/payments";
import { PayoffProvider } from "@/components/providers/payments/payoff";
import { TagsProvider } from "@/components/providers/tags";

const InvoiceslLayout = ({ children }: { children: React.ReactNode }) => (
    <TagsProvider>
        <PayoffProvider>
            <InvoicesProvider>
                <PaymentsProvider>
                    <PayoffProvider>{children}</PayoffProvider>
                </PaymentsProvider>
            </InvoicesProvider>
        </PayoffProvider>
    </TagsProvider>
);

export default InvoiceslLayout;
