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
            { label: "Mes atual", value: [dayjs().startOf("month"), dayjs().endOf("month")] as [Dayjs, Dayjs] },
            {
                label: "Proximo mes",
                value: [dayjs().add(1, "month").startOf("month"), dayjs().add(1, "month").endOf("month")] as [
                    Dayjs,
                    Dayjs,
                ],
            },
            {
                label: "Mes passado",
                value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] as [
                    Dayjs,
                    Dayjs,
                ],
            },
            { label: "Ultimos 30 dias", value: [dayjs().subtract(29, "day"), dayjs()] as [Dayjs, Dayjs] },
            (() => {
                const now = dayjs();
                const currentQuarter = Math.floor(now.month() / 3);
                const quarterStartMonth = currentQuarter === 0 ? 9 : currentQuarter * 3 - 3;
                const quarterYear = currentQuarter === 0 ? now.year() - 1 : now.year();
                const quarterStart = dayjs().year(quarterYear).month(quarterStartMonth).startOf("month");

                return {
                    label: "Ultimo trimestre",
                    value: [quarterStart, quarterStart.add(2, "month").endOf("month")] as [Dayjs, Dayjs],
                };
            })(),
            {
                label: "Ano passado",
                value: [dayjs().subtract(1, "year").startOf("year"), dayjs().subtract(1, "year").endOf("year")] as [
                    Dayjs,
                    Dayjs,
                ],
            },
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
                        <Space wrap className={styles.filterActions}>
                            <Button type="primary" htmlType="submit" loading={isFetchingPage} className={styles.filterButton}>
                                Atualizar relatorios
                            </Button>
                            <Button onClick={handleClearFilters} disabled={isFetchingPage} className={styles.filterButton}>
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
