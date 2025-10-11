import Link from "next/link";

import Image from "next/image";
import styles from "./Facetexture.module.scss";

import facetextureImage1 from "assets/facetexture-1.png";
import facetextureImage2 from "assets/facetexture-2.png";
import facetextureImage3 from "assets/facetexture-3.png";
import facetextureImage4 from "assets/facetexture-4.png";

export default function Facetexture() {
    return (
        <>
            <div className={styles["card-container"]}>
                <div className={styles["card"]}>
                    <h1>
                        Face Texture Editor é um programa simples que auxilia a alterar as Face Texture dos personagens
                        do Black Desert Online, criando assim um visual belo
                    </h1>

                    <Image
                        alt="Personalização de tela de ynomade"
                        title="Personalização de tela de ynomade"
                        className={styles["image"]}
                        src={facetextureImage1}
                        width={600}
                    />
                </div>
                <div className={styles["card"]}>
                    <Image
                        alt="Personalização de tela de scorpionemtv"
                        title="Personalização de tela de scorpionemtv"
                        className={styles["image"]}
                        src={facetextureImage2}
                        width={600}
                    />
                    <h1>De forma facil e simples personalize a seleção de personagem de seu jogo!</h1>
                </div>
                <div className={styles["card"]}>
                    <h1>Utilize qualquer imagem para uma personalização completa!</h1>
                    <Image
                        alt="Personalização de tela de kunash"
                        title="Personalização de tela de kunash"
                        className={styles["image"]}
                        src={facetextureImage3}
                        width={600}
                    />
                </div>
                <div className={styles["card"]}>
                    <Image
                        alt="Personalização de tela de Lilly"
                        title="Personalização de tela de Lilly"
                        className={styles["image"]}
                        src={facetextureImage4}
                        width={600}
                    />
                    <h1>Surpreenda seus amigos com sua seleção de personagem!</h1>
                </div>
            </div>
            <div className={styles["footer"]}>
                <Link className={styles["experiment-button"]} href={"/admin/facetexture"}>
                    Experimente agora
                </Link>
            </div>
        </>
    );
}
