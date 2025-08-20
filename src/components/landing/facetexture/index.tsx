import Image from "next/image";
import styles from "./facetexture.module.scss";
import facetextureImage1 from "assets/facetexture-ynomade.png";
import facetextureImage2 from "assets/facetexture-scorpionemtv.png";
import facetextureImage3 from "assets/facetexture-kunash.png";
import facetextureImage4 from "assets/facetexture-amigona.jpg";
import { MenuTheme } from "antd";

const Facetexture = ({ theme }: { theme: MenuTheme }) => {
    return (
        <div className={styles["container"]}>
            <div className={styles["section"]}>
                <div className={`${styles["item-left"]} ${styles[theme]}`}>
                    <Image
                        alt="Personalização de tela de ynomade"
                        title="Personalização de tela de ynomade"
                        className={styles["image"]}
                        src={facetextureImage1}
                        width={600}
                    />
                </div>
                <div className={styles["item-right"]}>
                    <h2 className={`${styles["text"]} ${styles[theme]}`}>
                        Com Kawori você pode personalizar a tela de seleção de personagens do seu jogo favorito com sua
                        imagem de preferencia, deixando seu jogo mais unico e especial.
                    </h2>
                </div>
            </div>
            <div className={styles["section"]}>
                <div className={styles["item-left"]}>
                    <h2 className={`${styles["text"]} ${styles[theme]}`}>
                        Você está a apenas um passo de um novo nivel de personalização do seu jogo!
                    </h2>
                </div>
                <div className={`${styles["item-right"]} ${styles[theme]}`}>
                    <Image
                        alt="Personalização de tela de scorpionemtv"
                        title="Personalização de tela de scorpionemtv"
                        className={styles["image"]}
                        src={facetextureImage2}
                        width={600}
                    />
                </div>
            </div>
            <div className={styles["section"]}>
                <div className={`${styles["item-left"]} ${styles[theme]}`}>
                    <Image
                        alt="Personalização de tela de kunash"
                        title="Personalização de tela de kunash"
                        className={styles["image"]}
                        src={facetextureImage3}
                        width={600}
                    />
                </div>
                <div className={styles["item-right"]}>
                    <h2 className={`${styles["text"]} ${styles[theme]}`}>O cadastro é gratuito, simples e rapido.</h2>
                </div>
            </div>
            <div className={styles["section"]}>
                <div className={styles["item-left"]}>
                    <h2 className={`${styles["text"]} ${styles[theme]}`}>
                        Cadastre-se e estilize sua tela de seleção agora mesmo!
                    </h2>
                </div>
                <div className={`${styles["item-right"]} ${styles[theme]}`}>
                    <Image
                        alt="Personalização de tela de Lilly"
                        title="Personalização de tela de Lilly"
                        className={styles["image"]}
                        src={facetextureImage4}
                        width={600}
                    />
                </div>
            </div>
        </div>
    );
};

export default Facetexture;
