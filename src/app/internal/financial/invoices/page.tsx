"use client";

import { ClearOutlined, EllipsisOutlined, ToTopOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Dropdown, Layout, MenuProps, Space, Typography } from "antd";

import InvoiceDrawer from "@/components/invoices/invoiceDrawer";
import InvoicesTable from "@/components/invoices/invoicesTable";
import { useInvoices } from "@/components/providers/invoices";
import { usePayoff } from "@/components/providers/payoff";
import { useSelectPayments } from "@/components/providers/selectPayments";
import { useTags } from "@/components/providers/tags";

import CsvImportModal from "@/components/csvImport/CsvImportModal";
import { useCsvImportProvider } from "@/components/providers/csvImport";
import { faFileCirclePlus, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import styles from "./Invoices.module.scss";

const { Title } = Typography;

function FinancialPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const { data: tags, loading: isLoadingTags } = useTags();
    const {
        invoicesData,
        refetchInvoices,
        isLoading,
        onChangePagination,
        invoiceFilters,
        handleChangeFilter,
        cleanFilter,
        onOpenInvoiceDetail,
        invoiceDetailVisible,
        onCloseInvoiceDetail,
        invoiceDetail,
        isLoadingInvoiceDetail,
        onUpdateInvoiceDetail,
        onCreateNewInvoice,
        updateFiltersBySearchParams,
    } = useInvoices();

    const { setOpenModal: SetOpenCsvImportModal } = useCsvImportProvider();

    useEffect(() => {
        Promise.resolve(searchParams).then((params) => {
            updateFiltersBySearchParams(params);
        });
    }, []);

    const { selectedRow } = useSelectPayments();

    const { openPayoffBatchModal, setCallback } = usePayoff();

    const onMenuClick: MenuProps["onClick"] = ({ key }) => {
        switch (key) {
            case "cleanFilter":
                cleanFilter();
                break;
            case "payoffPayment":
                setCallback(() => {
                    refetchInvoices();
                });
                openPayoffBatchModal();
                break;
            case "importCsv":
                SetOpenCsvImportModal(true);
                break;
            default:
                break;
        }
    };

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Notas</Breadcrumb.Item>
                <Breadcrumb.Item>Em aberto</Breadcrumb.Item>
            </Breadcrumb>
            <Layout>
                <div className={styles.header_command}>
                    <Title level={3} className={styles.title}>
                        Valores em aberto
                    </Title>
                    <div>
                        <Space.Compact>
                            <Button
                                icon={<FontAwesomeIcon icon={faFileCirclePlus} />}
                                type="primary"
                                onClick={() => onOpenInvoiceDetail(undefined)}
                            >
                                Adicionar nota
                            </Button>
                            <Dropdown
                                trigger={["click"]}
                                menu={{
                                    items: [
                                        {
                                            key: "importCsv",
                                            label: "Importar CSV",
                                            icon: <FontAwesomeIcon icon={faUpload} />,
                                        },
                                        { key: "cleanFilter", label: "Limpar filtros", icon: <ClearOutlined /> },
                                        {
                                            key: "payoffPayment",
                                            label: "Baixar pagamentos",
                                            icon: <ToTopOutlined />,
                                            disabled: selectedRow.filter((item) => item.selected).length === 0,
                                        },
                                    ],
                                    onClick: onMenuClick,
                                }}
                                placement="bottomRight"
                            >
                                <Button icon={<EllipsisOutlined />} style={{ height: "34px" }} />
                            </Dropdown>
                        </Space.Compact>
                    </div>
                </div>
                <InvoicesTable
                    data={invoicesData}
                    isLoading={isLoading}
                    filters={invoiceFilters}
                    handleChangeFilter={handleChangeFilter}
                    onChangePagination={onChangePagination}
                    onOpenInvoiceDetail={onOpenInvoiceDetail}
                />
            </Layout>
            <InvoiceDrawer
                open={invoiceDetailVisible}
                onClose={onCloseInvoiceDetail}
                invoiceDetail={invoiceDetail}
                isLoading={isLoadingInvoiceDetail}
                onUpdateInvoiceDetail={onUpdateInvoiceDetail}
                onCreateNewInvoice={onCreateNewInvoice}
                tags_data={tags}
                isLoadingTags={isLoadingTags}
                isDefaultFixed={false}
            />
            <CsvImportModal />
        </>
    );
}

export default FinancialPage;
