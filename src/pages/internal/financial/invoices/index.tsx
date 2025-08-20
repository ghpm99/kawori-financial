import { PlusOutlined } from '@ant-design/icons';
import styles from './invoices.module.scss';
import { Button, Card, Table, Typography } from 'antd';
import { useState } from 'react';
const InvoicesPage = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const financialStore = useSelector((state: RootState) => state.financial.invoice);

    useEffect(() => {
        document.title = 'Kawori Notas';
        dispatch(setSelectedMenu(['financial', 'invoices']));

        dispatch(
            setFiltersInvoice({
                ...searchParams,
            }),
        );
    }, []);

    useEffect(() => {
        updateSearchParams(router, pathname, financialStore.filters);
        dispatch(fetchAllInvoice(financialStore.filters));
    }, [financialStore.filters, dispatch, router, pathname]);

    const onChangePagination = (page: number, pageSize: number) => {
        dispatch(
            changePagination({
                page: page,
                pageSize: pageSize,
            }),
        );
    };

    const headerTableFinancial = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            render: (value: any) => (
                <Link href={`/admin/financial/invoices/details/${value}`}>{value}</Link>
            ),
        },
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Valor',
            dataIndex: 'value',
            key: 'value',
            render: (value: any) => formatMoney(value),
        },
        {
            title: 'Baixado',
            dataIndex: 'value_closed',
            key: 'value_closed',
            render: (value: any) => formatMoney(value),
        },
        {
            title: 'Em aberto',
            dataIndex: 'value_open',
            key: 'value_open',
            render: (value: any) => formatMoney(value),
        },
        {
            title: 'Parcelas',
            dataIndex: 'installments',
            key: 'installments',
        },
        {
            title: 'Dia',
            dataIndex: 'date',
            key: 'date',
            render: (value: any) => formatterDate(value),
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: (_: any, { tags }: IInvoicePagination) => (
                <>
                    {tags.map((tag) => (
                        <Tag color={tag.color} key={`invoice-tags-${tag.id}`}>
                            {tag.name}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: 'Ações',
            dataIndex: 'id',
            key: 'id',
            render: (value: any) => (
                <Link href={`/admin/financial/invoices/details/${value}`}>Detalhes</Link>
            ),
        },
    ];

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Em aberto</Breadcrumb.Item>
            </Breadcrumb>
            <Layout>
                <div className={styles.header_command}>
                    <Title level={3} className={styles.title}>
                        Valores em aberto
                    </Title>
                    <div>
                        <Button icon={<SearchOutlined />}>Filtrar</Button>
                    </div>
                </div>
                <Table
                    pagination={{
                        showSizeChanger: true,
                        pageSize: financialStore.filters.page_size,
                        current: financialStore.pagination.currentPage,
                        total:
                            financialStore.pagination.totalPages * financialStore.filters.page_size,
                        onChange: onChangePagination,
                    }}
                    columns={headerTableFinancial}
                    dataSource={financialStore.data}
                    loading={financialStore.loading}
                    summary={(invoiceData) => <TableSummary invoiceData={invoiceData} />}
                />
            </Layout>
        </>
    );
};

function TableSummary({ invoiceData }: { invoiceData: readonly IInvoicePagination[] }) {
    const { Text } = Typography;

    let total = 0;
    let totalOpen = 0;
    let totalClosed = 0;
    invoiceData.forEach((invoice) => {
        total = total + invoice.value;
        totalOpen = totalOpen + invoice.value_open;
        totalClosed = totalClosed + invoice.value_closed;
    });

    return (
        <>
            <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                    <Text>Total: {formatMoney(total)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                    <Text>Em aberto: {formatMoney(totalOpen)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                    <Text>Baixado: {formatMoney(totalClosed)}</Text>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        </>
    );
}

export default InvoicesPage;
