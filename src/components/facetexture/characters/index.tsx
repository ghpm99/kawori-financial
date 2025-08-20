import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Tooltip, Typography } from "antd";
import { useSelector } from "react-redux";
import { changeModalVisible } from "@/lib/features/facetexture";
import { RootState } from "@/lib/store";
import Styles from "./Characters.module.scss";
import DragAndDropCharacters from "./dragAndDrop";
import Info from "./info";
import NewModal from "./newModal";
import { useAppDispatch } from "@/lib/hooks";
import { Theme } from "@/styles/theme";

const { Title } = Typography;
const Characters = ({ theme }: { theme: Theme }) => {
    const dispatch = useAppDispatch();
    const facetextureStore = useSelector((state: RootState) => state.facetexture);

    const toggleModalVisible = () => {
        dispatch(
            changeModalVisible({
                modal: "newFacetexture",
                visible: !facetextureStore.modal.newFacetexture.visible,
            }),
        );
    };

    const disableNewButton = facetextureStore.facetexture.length >= 41;

    return (
        <div className={`${Styles["characters"]} ${Styles[theme]}`}>
            <div>
                <Title level={4}>
                    Personagens
                    <Tooltip
                        showArrow
                        title="Organize seus personagens clicando em 'Incluir Novo Personagem' para adicionar novo e clicando e arrastando para mudar a ordem.
                        Você também pode editar as informações do personagem clicando sobre a imagem."
                    >
                        <FontAwesomeIcon icon={faCircleInfo} />
                    </Tooltip>
                </Title>
                <Button type="primary" disabled={disableNewButton} onClick={() => toggleModalVisible()}>
                    Incluir Novo Personagem
                </Button>
                <DragAndDropCharacters />
            </div>
            <Info />
            <NewModal toggleVisible={toggleModalVisible} theme={theme} />
        </div>
    );
};

export default Characters;
