import { render, screen } from "@testing-library/react";
import Facetexture from "./index";

describe("Facetexture Component", () => {
    test("should render all images with correct alt text", () => {
        render(<Facetexture />);

        const images = [
            { alt: "Personalização de tela de ynomade", src: "facetexture-ynomade.png" },
            { alt: "Personalização de tela de scorpionemtv", src: "facetexture-scorpionemtv.png" },
            { alt: "Personalização de tela de kunash", src: "facetexture-kunash.png" },
            { alt: "Personalização de tela de Lilly", src: "facetexture-amigona.jpg" },
        ];

        images.forEach((image) => {
            const imgElement = screen.getByAltText(image.alt);
            expect(imgElement).toBeInTheDocument();
            expect(imgElement).toHaveAttribute(
                "src",
                expect.stringContaining("/_next/image?url=%2Fimg.jpg&w=1200&q=75"),
            );
        });
    });

    test("should render all text content correctly", () => {
        render(<Facetexture />);

        const texts = [
            "Com Kawori você pode personalizar a tela de seleção de personagens do seu jogo favorito com sua imagem de preferencia, deixando seu jogo mais unico e especial.",
            "Você está a apenas um passo de um novo nivel de personalização do seu jogo!",
            "O cadastro é gratuito, simples e rapido.",
            "Cadastre-se e estilize sua tela de seleção agora mesmo!",
        ];

        texts.forEach((text) => {
            const textElement = screen.getByText(text);
            expect(textElement).toBeInTheDocument();
        });
    });
});
