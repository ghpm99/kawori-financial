import { ExclamationCircleOutlined, MoonOutlined, SunFilled } from "@ant-design/icons";
import { Tooltip } from "antd";
import styles from "./themeControl.module.scss";
import useThemeControl from "./useThemeControl";

const ThemeControl = () => {
    const { theme, toggleTheme } = useThemeControl();

    const Icon = theme === "light" ? MoonOutlined : SunFilled;

    return (
        <div className={styles["theme-mode"]}>
            <Tooltip
                title={
                    <div className={styles["tooltip"]}>
                        <ExclamationCircleOutlined className={styles["tooltip-icon"]} />
                        Clique para mudar o tema da sua interface
                    </div>
                }
                placement="topRight"
                trigger={["click", "hover"]}
            >
                <Icon alt="theme-icon" onClick={toggleTheme} className={`${styles["theme-icon"]} ${styles[theme]}`} />
            </Tooltip>
        </div>
    );
};

export default ThemeControl;
