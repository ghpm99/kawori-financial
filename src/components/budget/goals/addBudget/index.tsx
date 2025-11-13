import { useState } from "react";

import { Button, Form, Input } from "antd";

import { useBudget } from "@/components/providers/budget";

const AddBudgetGoal = () => {
    const { addBudget } = useBudget();
    const [showForm, setShowForm] = useState(false);
    const [form] = Form.useForm();

    const handleClick = () => {
        if (!showForm) {
            setShowForm(true);
            return;
        }
        form.submit();
        setShowForm(false);
    };

    const onFinish = (values: any) => {
        addBudget({
            ...values,
            id: String(Date.now()),
            amount: 0,
        });
        form.resetFields();
    };

    return (
        <>
            {showForm && (
                <Form form={form} layout="inline" hideRequiredMark variant="underlined" onFinish={onFinish}>
                    <Form.Item
                        name="name"
                        label="Nome"
                        rules={[{ required: true, message: "Por favor digite o nome da meta" }]}
                    >
                        <Input placeholder="Por favor digite o nome da meta" />
                    </Form.Item>
                    <Form.Item label="Cor" name="color">
                        <input type="color" data-testid="tag-color" />
                    </Form.Item>
                </Form>
            )}
            <Button type="primary" onClick={handleClick}>
                Adicionar Meta
            </Button>
        </>
    );
};

export default AddBudgetGoal;
