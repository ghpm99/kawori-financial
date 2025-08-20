import { Typography } from "antd";
import styles from "./welcome.module.scss";

const { Title } = Typography;

const Welcome = () => {
    return (
        <div className={styles["intro-text"]}>
            <Title level={1}>Bem vindo a Kawori!</Title>
            <Title level={2}>
                Kawori é uma plataforma de personalização de tela de seleção de personagens para Black Desert Online.
            </Title>
        </div>
    );
};

export default Welcome;
