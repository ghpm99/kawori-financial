"use client";
import FilterDropdown from "@/components/common/filterDropdown/Index";
import LoadingPage from "@/components/loadingPage/Index";
import ModalPayoff, { ITableDataSource } from "@/components/payments/modalPayoff";
import {
    changeDataSourcePayoffPayments,
    changeSingleDataSourcePayoffPayments,
    changeStatusPaymentPagination,
    changeVisibleModalPayoffPayments,
    fetchAllPayment,
    setFilterPayments,
    setFiltersPayments,
} from "@/lib/features/financial/payment";
import { ClearOutlined, SearchOutlined, ToTopOutlined } from "@ant-design/icons";
import {
    Breadcrumb,
    Button,
    DatePicker,
    Dropdown,
    Input,
    Layout,
    MenuProps,
    Select,
    Space,
    Table,
    Typography,
    message,
} from "antd";
import dayjs from "dayjs";

import { RootState } from "@/lib/store";
import { payoffPaymentService } from "@/services/financial";
import Link from "next/link";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import { setSelectedMenu } from "@/lib/features/auth";
import { useAppDispatch } from "@/lib/hooks";
import { formatMoney, formatterDate, updateSearchParams } from "@/util/index";
import { usePathname, useRouter } from "next/navigation";

import PaymentsDrawer from "@/components/payments/paymentsDrawer";
import { usePayments } from "@/components/providers/payments";
import { faEllipsis, faFileCircleCheck, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Payments.module.scss";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const customFormat = ["DD/MM/YYYY", "DD/MM/YYYY"];
const messageKey = "payment_pagination_message";

function FinancialPage({ searchParams }) {
    const {
        paymentFilters,
        paymentsData,
        isLoading,
        onChangePagination,
        handleChangeFilter,
        handleDateRangedFilter,
        handleSelectFilter,
        cleanFilter,
        selectedRowKeys,
        setSelectedRowKeys,
        paymentDetailVisible,
        onClosePaymentDetail,
        onOpenPaymentDetail,
        isLoadingPaymentDetail,
        paymentDetail,
    } = usePayments();

    const financialStore = useSelector((state: RootState) => state.financial.payment);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        document.title = "Kawori Pagamentos";
        dispatch(setSelectedMenu(["financial", "payments"]));
        dispatch(
            setFiltersPayments({
                ...searchParams,
            }),
        );
    }, []);

    useEffect(() => {
        updateSearchParams(router, pathname, paymentFilters);
        dispatch(fetchAllPayment(paymentFilters));
    }, [paymentFilters, dispatch, router, pathname]);

    const applyFilter = (event: any) => {
        event.preventDefault();
        dispatch(setFilterPayments({ name: "active", value: true }));
    };

    const payOffPayment = (id: number) => {
        message.loading({
            key: messageKey,
            content: "Processando",
        });
        payoffPaymentService(id).then((data) => {
            message.success({
                content: data.msg,
                key: messageKey,
            });
            dispatch(
                changeStatusPaymentPagination({
                    id: id,
                    status: 1,
                }),
            );
        });
    };

    const togglePayoffModalVisible = () => {
        dispatch(changeVisibleModalPayoffPayments(!financialStore.modal.payoff.visible));
    };

    const openPayoffModal = () => {
        const dataSource: ITableDataSource[] = selectedRowKeys.map((id) => ({
            id: parseInt(id.toString()),
            description: "Aguardando",
            status: 0,
        }));

        dispatch(changeDataSourcePayoffPayments(dataSource));

        dispatch(changeVisibleModalPayoffPayments(true));
    };

    const processPayOff = () => {
        financialStore.modal.payoff.data.forEach(async (data, index) => {
            dispatch(
                changeSingleDataSourcePayoffPayments({
                    ...data,
                    description: "Em progresso",
                }),
            );
            payoffPaymentService(data.id)
                .then((response) => {
                    dispatch(
                        changeSingleDataSourcePayoffPayments({
                            ...data,
                            description: response.msg,
                            status: 1,
                        }),
                    );
                })
                .catch((error) => {
                    dispatch(
                        changeSingleDataSourcePayoffPayments({
                            ...data,
                            description: error.response.data.msg ?? "Falhou em processar",
                            status: 1,
                        }),
                    );
                });
        });
    };

    const createDropdownMenu = (record: PaymentItem): MenuProps => {
        const items: MenuProps["items"] = [
            {
                key: "1",
                label: "Ações",
                disabled: true,
            },
            {
                type: "divider",
            },
            {
                key: "2",
                icon: <FontAwesomeIcon icon={faFilePen} />,
                label: "Editar",
                onClick: () => onOpenPaymentDetail(record.id),
            },
            {
                key: "3",
                icon: <FontAwesomeIcon icon={faFileCircleCheck} />,
                label: "Pagar",
                disabled: record.status === 1,
                onClick: () => payOffPayment(record.id),
            },
        ];

        return { items };
    };

    const headerTableFinancial = [
        {
            title: "Nome",
            dataIndex: "name",
            key: "name",
            filterDropdown: () => (
                <FilterDropdown applyFilter={applyFilter}>
                    <Input
                        name="name__icontains"
                        style={{ width: 220 }}
                        onChange={(event) => handleChangeFilter(event)}
                        value={paymentFilters?.name__icontains ?? ""}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Contrato",
            dataIndex: "contract",
            key: "contract",
            render: (value: string, record: any) => (
                <Link href={`/internal/financial/contracts/details/${record.contract_id}`}>{record.contract_name}</Link>
            ),
            filterDropdown: () => (
                <FilterDropdown applyFilter={applyFilter}>
                    <Input
                        name="contract"
                        style={{ width: 220 }}
                        onChange={(event) => handleChangeFilter(event)}
                        value={paymentFilters?.contract ?? ""}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Valor",
            dataIndex: "value",
            key: "value",
            render: (value: any) => formatMoney(value),
        },
        {
            title: "Dia de pagamento",
            dataIndex: "payment_date",
            key: "payment_date",
            render: (value: any) => formatterDate(value),
            filterDropdown: () => (
                <FilterDropdown applyFilter={applyFilter}>
                    <RangePicker
                        name={"payment_date"}
                        onChange={(_, formatString) => {
                            handleDateRangedFilter("payment_date", formatString);
                        }}
                        format={customFormat}
                        value={[dayjs(paymentFilters?.payment_date__gte), dayjs(paymentFilters?.payment_date__lte)]}
                        ranges={{
                            Hoje: [dayjs(), dayjs()],
                            Ontem: [dayjs().subtract(1, "days"), dayjs().subtract(1, "days")],
                            "Últimos 7 dias": [dayjs().subtract(7, "days"), dayjs()],
                            "Últimos 30 dias": [dayjs().subtract(30, "days"), dayjs()],
                            "Mês atual": [dayjs().startOf("month"), dayjs().endOf("month")],
                            "Proximo mês": [
                                dayjs().add(1, "months").startOf("month"),
                                dayjs().add(1, "months").endOf("month"),
                            ],
                            "Mês passado": [
                                dayjs().subtract(1, "month").startOf("month"),
                                dayjs().subtract(1, "month").endOf("month"),
                            ],
                        }}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value: any) => (value === 0 ? "Em aberto" : "Baixado"),
            filterDropdown: () => (
                <FilterDropdown applyFilter={applyFilter}>
                    <Select
                        style={{ width: 220 }}
                        options={[
                            { label: "Todos", value: "" },
                            { label: "Em aberto", value: 0 },
                            { label: "Baixado", value: 1 },
                        ]}
                        onChange={(value) => handleSelectFilter("status", value)}
                        value={paymentFilters?.status ?? ""}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Tipo",
            dataIndex: "type",
            key: "type",
            render: (text: any) => (text === 0 ? "Credito" : "Debito"),
            filterDropdown: () => (
                <FilterDropdown applyFilter={applyFilter}>
                    <Select
                        style={{ width: 220 }}
                        options={[
                            { label: "Todos", value: "" },
                            { label: "Credito", value: 0 },
                            { label: "Debito", value: 1 },
                        ]}
                        onChange={(value) => handleSelectFilter("type", value)}
                        value={paymentFilters?.type ?? ""}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Data",
            dataIndex: "date",
            key: "dataIndex",
            render: (value: any) => formatterDate(value),
            filterDropdown: () => (
                <FilterDropdown applyFilter={applyFilter}>
                    <RangePicker
                        name={"date"}
                        onChange={(_, formatString) => {
                            handleDateRangedFilter("date", formatString);
                        }}
                        format={customFormat}
                        value={[dayjs(paymentFilters?.date__gte), dayjs(paymentFilters?.date__lte)]}
                        ranges={{
                            Hoje: [dayjs(), dayjs()],
                            Ontem: [dayjs().subtract(1, "days"), dayjs().subtract(1, "days")],
                            "Últimos 7 dias": [dayjs().subtract(7, "days"), dayjs()],
                            "Últimos 30 dias": [dayjs().subtract(30, "days"), dayjs()],
                            "Mês atual": [dayjs().startOf("month"), dayjs().endOf("month")],
                            "Proximo mês": [
                                dayjs().add(1, "months").startOf("month"),
                                dayjs().add(1, "months").endOf("month"),
                            ],
                            "Mês passado": [
                                dayjs().subtract(1, "month").startOf("month"),
                                dayjs().subtract(1, "month").endOf("month"),
                            ],
                        }}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },

        {
            title: "Parcela",
            dataIndex: "installments",
            key: "installments",
        },

        {
            title: "Fixo",
            dataIndex: "fixed",
            key: "fixed",
            render: (value: any) => (value ? "Sim" : "Não"),
        },
        {
            title: "Ações",
            dataIndex: "id",
            key: "id",
            render: (value: any, record: any) => (
                <Dropdown menu={createDropdownMenu(record)}>
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <FontAwesomeIcon icon={faEllipsis} />
                        </Space>
                    </a>
                </Dropdown>
            ),
        },
    ];

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Pagamentos</Breadcrumb.Item>
            </Breadcrumb>
            <Layout>
                <div className={styles.header_command}>
                    <Title level={3} className={styles.title}>
                        Pagamentos
                    </Title>
                    <div>
                        <Button
                            icon={<ToTopOutlined />}
                            onClick={openPayoffModal}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Baixar pagamentos
                        </Button>
                        <Button icon={<ClearOutlined />} onClick={cleanFilter}>
                            Limpar filtros
                        </Button>
                    </div>
                </div>
                <Table
                    pagination={{
                        showSizeChanger: true,
                        pageSize: paymentFilters.page_size,
                        current: paymentFilters.page,
                        total: paymentsData.total_pages * paymentFilters.page_size,
                        onChange: onChangePagination,
                    }}
                    columns={headerTableFinancial}
                    rowSelection={{
                        type: "checkbox",
                        selectedRowKeys,
                        onChange: (selectedRowKeys, selectedRows) => {
                            setSelectedRowKeys(selectedRowKeys);
                        },
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
                        getCheckboxProps: (record) => ({
                            disabled: record.status === 1,
                        }),
                    }}
                    dataSource={paymentsData.data}
                    loading={isLoading}
                    summary={(paymentData) => <TableSummary paymentData={paymentData} />}
                />
                <ModalPayoff
                    visible={financialStore.modal.payoff.visible}
                    onCancel={togglePayoffModalVisible}
                    onPayoff={processPayOff}
                    data={financialStore.modal.payoff.data}
                />
                <PaymentsDrawer
                    onClose={onClosePaymentDetail}
                    open={paymentDetailVisible}
                    paymentDetail={paymentDetail}
                    isLoading={isLoadingPaymentDetail}
                />
            </Layout>
        </>
    );
}

function TableSummary({ paymentData }: { paymentData: readonly IPaymentPagination[] }) {
    const { Text } = Typography;

    let total = 0;
    let totalCredit = 0;
    let totalDebit = 0;
    paymentData.forEach((payment) => {
        if (payment.type === 0) {
            total = total + payment.value;
            totalCredit = totalCredit + payment.value;
        } else {
            total = total - payment.value;
            totalDebit = totalDebit + payment.value;
        }
    });

    return (
        <>
            <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2} index={0}>
                    <Text>Total: {formatMoney(total)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                    <Text>Total Credito: {formatMoney(totalCredit)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                    <Text>Total Debito: {formatMoney(totalDebit)}</Text>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        </>
    );
}

FinancialPage.auth = {
    role: "admin",
    loading: <LoadingPage />,
    unauthorized: "/signin",
};

export default FinancialPage;
