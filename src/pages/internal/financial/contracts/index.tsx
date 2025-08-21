import type { INewContractForm } from '@/components/contracts/modalNew';
import { ContractProvider, useContract } from '@/providers/contracts';
import { formatMoney } from '@/util';
import { Breadcrumb, Layout, Table, Typography } from 'antd';
import { Link } from 'react-router-dom';
import styles from './contracts.module.scss';

const { Title } = Typography;

const ContractsPage = () => {
    const { filters, pagination, data, loading } = useContract();

    const closeModal = (modal) => {};

    const onFinish = (values: INewContractForm) => {
        const newContract = {
            name: values.name,
        };
    };

    const onChangePagination = (page: number, pageSize: number) => {};

    const headerTableFinancial = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            render: (value: any) => (
                <Link to={`/admin/financial/contracts/details/${value}`}>{value}</Link>
            ),
        },
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Total',
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
            title: 'Ações',
            dataIndex: 'id',
            key: 'id',
            render: (value: any) => (
                <Link to={`/admin/financial/contracts/details/${value}`}>Detalhes</Link>
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
                </div>
                <Table
                    pagination={{
                        showSizeChanger: true,
                        defaultPageSize: filters.page_size,
                        current: pagination.currentPage,
                        total: pagination.totalPages * filters.page_size,
                        onChange: onChangePagination,
                    }}
                    columns={headerTableFinancial}
                    dataSource={data}
                    loading={loading}
                    summary={(contractData) => <TableSummary contractData={contractData} />}
                />
            </Layout>
        </>
    );
};

function TableSummary({ contractData }: { contractData: readonly IContract[] }) {
    const { Text } = Typography;

    let total = 0;
    let totalOpen = 0;
    let totalClosed = 0;
    contractData.forEach((contract) => {
        total = total + contract.value;
        totalOpen = totalOpen + contract.value_open;
        totalClosed = totalClosed + contract.value_closed;
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

const WrappedContractPage = () => {
    return (
        <ContractProvider>
            <ContractsPage />
        </ContractProvider>
    );
};

export default WrappedContractPage;
