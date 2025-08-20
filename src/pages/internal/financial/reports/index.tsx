import Cards from '@/components/overview/cards';
import { Breadcrumb, Flex, Table, Tag } from 'antd';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
);

const headerTableFinancial = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Nome',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Total',
        dataIndex: 'total_value_credit',
        key: 'total_value_credit',
        render: (_: string, record: IPaymentMonth) => {
            const credit = formatMoney(record.total_value_credit ?? 0);
            const debit = formatMoney(record.total_value_debit ?? 0);
            return (
                <div>
                    <Tag color="green">+{credit}</Tag>
                    <Tag color="volcano">-{debit}</Tag>
                </div>
            );
        },
    },
    {
        title: 'Total em aberto',
        dataIndex: 'total_value_open',
        key: 'total_value_open',
        render: (value: any) => (value ? formatMoney(value) : ''),
    },
    {
        title: 'Total baixado',
        dataIndex: 'total_value_closed',
        key: 'total_value_closed',
        render: (value: any) => (value ? formatMoney(value) : ''),
    },
    {
        title: 'Totais de pagamentos',
        dataIndex: 'total_payments',
        key: 'total_payments',
    },
];
const ReportsPage = () => {
    const overviewStore = useSelector((state: RootState) => state.financial.overview);
    const {
        state: { theme },
    } = useTheme();
    const dispatch = useAppDispatch();

    useEffect(() => {
        document.title = 'Kawori Overview';
        dispatch(setSelectedMenu(['financial', 'overview']));

        dispatch(fetchMonthPayments());
        dispatch(fetchPaymentReportThunk());
        dispatch(fetchCountPaymentReportThunk());
        dispatch(fetchAmountPaymentReportThunk());
        dispatch(fetchAmountPaymentOpenReportThunk());
        dispatch(fetchAmountPaymentClosedReportThunk());
        dispatch(fetchAmountInvoiceByTagReportThunk());
        dispatch(fetchAmountForecastValueThunk());
    }, []);

    function OverviewReport() {
        return (
            <Flex align="center" vertical gap={'8px'}>
                <Cards
                    countPayment={overviewStore.data.countPayment}
                    amountPayment={overviewStore.data.amountPayment}
                    amountPaymentOpen={overviewStore.data.amountPaymentOpen}
                    amountPaymentClosed={overviewStore.data.amountPaymentClosed}
                    loading={overviewStore.loading}
                />
                <Table
                    className={styles['table']}
                    columns={headerTableFinancial}
                    dataSource={overviewStore.data.month}
                    loading={overviewStore.loading}
                    summary={(paymentData) => <TableSummary paymentData={paymentData} />}
                    pagination={false}
                    style={{
                        borderRadius: '20px',
                    }}
                    bordered
                />
                <PaymentWithFixed theme={theme} data={overviewStore.data.payments} />
                <InvoiceByTag theme={theme} data={overviewStore.data.invoiceByTag} />
                <AccumulatedValue
                    theme={theme}
                    payments={overviewStore.data.payments}
                    amountForecastValue={overviewStore.data.amountForecastValue}
                />
                <PaymentFixed
                    theme={theme}
                    fixedCredit={overviewStore.data.fixed_credit}
                    fixedDebit={overviewStore.data.fixed_debit}
                />
            </Flex>
        );
    }

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Overview</Breadcrumb.Item>
            </Breadcrumb>
            <Layout>
                <OverviewReport />
            </Layout>
        </>
    );
};

function TableSummary({ paymentData }: { paymentData: readonly IPaymentMonth[] }) {
    const { Text } = Typography;

    let totalCredit = 0;
    let totalDebit = 0;
    let totalClosed = 0;
    let totalOpen = 0;
    let totalPayments = 0;
    paymentData.forEach((payment) => {
        totalCredit = totalCredit + payment.total_value_credit;
        totalDebit = totalDebit + payment.total_value_debit;
        totalOpen = totalOpen + payment.total_value_open;
        totalClosed = totalClosed + payment.total_value_closed;
        totalPayments = totalPayments + payment.total_payments;
    });

    return (
        <>
            <Table.Summary.Row>
                <Table.Summary.Cell index={1} colSpan={2}>
                    <Text strong>Totais:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                    <Tag color="green">+{formatMoney(totalCredit)}</Tag>
                    <Tag color="volcano">-{formatMoney(totalDebit)}</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                    <Text strong>{formatMoney(totalOpen)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                    <Text strong>{formatMoney(totalClosed)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                    <Text strong>{totalPayments}</Text>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        </>
    );
}

export default ReportsPage;
