import { useEffect, useMemo } from "react";

import { Button, Card, Col, DatePicker, Form, Row, Space, Tag, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { useReport } from "@/components/providers/report";

import styles from "../Overview.module.scss";

const { Text } = Typography;

type FilterFormValues = {
    period?: [Dayjs, Dayjs];
};

export function ReportFilters() {
    const [form] = Form.useForm<FilterFormValues>();
    const { activeFilters, applyDateRange, clearFilters, isFetchingPage } = useReport();

    useEffect(() => {
        const hasRange = activeFilters.date_from && activeFilters.date_to;

        form.setFieldsValue({
            period: hasRange ? [dayjs(activeFilters.date_from), dayjs(activeFilters.date_to)] : undefined,
        });
    }, [activeFilters, form]);

    const onFinish = (values: FilterFormValues) => {
        applyDateRange(values.period);
    };

    const handleClearFilters = () => {
        form.resetFields();
        clearFilters();
    };

    const presets = useMemo(
        () => [
            { label: "Ultimos 30 dias", value: [dayjs().subtract(29, "day"), dayjs()] as [Dayjs, Dayjs] },
            { label: "Mes atual", value: [dayjs().startOf("month"), dayjs().endOf("month")] as [Dayjs, Dayjs] },
            {
                label: "Ultimos 90 dias",
                value: [dayjs().subtract(89, "day"), dayjs()] as [Dayjs, Dayjs],
            },
            { label: "Ano atual", value: [dayjs().startOf("year"), dayjs().endOf("year")] as [Dayjs, Dayjs] },
        ],
        [],
    );

    return (
        <Card title="Filtro de periodo" className={styles.filtersCard}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} lg={10}>
                        <Form.Item name="period" label="Periodo de analise">
                            <DatePicker.RangePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                presets={presets}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} lg={14} className={styles.filterActionsCol}>
                        <Space wrap>
                            <Button type="primary" htmlType="submit" loading={isFetchingPage}>
                                Atualizar relatorios
                            </Button>
                            <Button onClick={handleClearFilters} disabled={isFetchingPage}>
                                Limpar filtro
                            </Button>
                            {isFetchingPage ? <Text type="secondary">Atualizando dados...</Text> : null}
                        </Space>
                    </Col>
                </Row>
            </Form>

            {(activeFilters.date_from || activeFilters.date_to) && (
                <Space className={styles.filterTags} wrap>
                    {activeFilters.date_from ? <Tag>{`Data inicial: ${activeFilters.date_from}`}</Tag> : null}
                    {activeFilters.date_to ? <Tag>{`Data final: ${activeFilters.date_to}`}</Tag> : null}
                </Space>
            )}
        </Card>
    );
}
