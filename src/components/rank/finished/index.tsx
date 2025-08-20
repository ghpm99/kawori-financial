import { Button, Card, Result } from "antd";
import styles from "./finished.module.scss";
import Link from "next/link";

const Finished = () => {
    return (
        <>
            <Card title={<h2>Concluído</h2>}>
                <div className={styles["text"]}>
                    <Result
                        status="success"
                        title="Obrigado por votar!"
                        subTitle="Seu voto foi recebido e está sendo processado!"
                        extra={[
                            <Button type="primary" key="console">
                                <Link href="/internal/rank">Voltar</Link>
                            </Button>,
                        ]}
                    />
                </div>
            </Card>
        </>
    );
};

export default Finished;
