import {
    updateFacetextureClassModalReducer,
    updateFacetextureImageNameModalReducer,
    updateFacetextureVisibleClassModalReducer,
} from "@/lib/features/facetexture";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { newCharacterThunk } from "@/services/facetexture";
import { PlusOutlined } from "@ant-design/icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox, Modal, Select, Tooltip, Typography, message } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RcFile } from "antd/lib/upload";
import Dragger from "antd/lib/upload/Dragger";
import { useSelector } from "react-redux";
import styles from "./newModal.module.scss";
import { FACETEXTURE_MESSAGE_REF } from "@/util";
import { Theme } from "@/styles/theme";

const { Title } = Typography;

interface INewModalProps {
    toggleVisible: () => void;
    theme: Theme;
}

const NewModal = ({ toggleVisible, theme }: INewModalProps) => {
    const dispatch = useAppDispatch();
    const facetextureStore = useSelector((state: RootState) => state.facetexture);
    const disableOkButton = () => {
        const classInvalid = facetextureStore.modal.newFacetexture.data.classId === 0;
        const fileNameInvalid = facetextureStore.modal.newFacetexture.data.name.length <= 5;
        return classInvalid || fileNameInvalid;
    };

    const updateCharacterClass = (value: number) => {
        dispatch(
            updateFacetextureClassModalReducer({
                classId: value,
            }),
        );
    };

    const updateCharacterShowClass = (event: CheckboxChangeEvent) => {
        dispatch(
            updateFacetextureVisibleClassModalReducer({
                visible: event.target.checked,
            }),
        );
    };

    const updateImageSelectedCharacter = (file: RcFile) => {
        dispatch(
            updateFacetextureImageNameModalReducer({
                name: file.name,
            }),
        );
    };

    const includeNewFacetexture = () => {
        message.loading({
            content: "Salvando",
            key: FACETEXTURE_MESSAGE_REF,
        });
        dispatch(
            newCharacterThunk({
                ...facetextureStore.modal.newFacetexture.data,
            }),
        )
            .then((value) => {
                if (value.type.includes("fulfilled")) {
                    message.success({
                        content: "Personagem incluso com sucesso!",
                        key: FACETEXTURE_MESSAGE_REF,
                    });
                }
            })
            .catch(() => {
                message.error({
                    content: "Falhou em incluir novo personagem!",
                    key: FACETEXTURE_MESSAGE_REF,
                });
            });
    };

    const classSelectOption =
        facetextureStore.modal.newFacetexture.data.classId == 0
            ? undefined
            : facetextureStore.modal.newFacetexture.data.classId;

    return (
        <Modal
            title="Criar novo personagem"
            open={facetextureStore.modal.newFacetexture.visible}
            onCancel={toggleVisible}
            onOk={includeNewFacetexture}
            confirmLoading={facetextureStore.modal.newFacetexture.saving}
            okButtonProps={{ disabled: disableOkButton() }}
        >
            <div className={styles["controllers-info"]}>
                <Title level={5}>
                    Classe do personagem
                    <Tooltip title="Selecione a classe que voce quer que apareça no resultado final.">
                        <FontAwesomeIcon icon={faCircleInfo} />
                    </Tooltip>
                    :
                </Title>
                <Select
                    options={facetextureStore.class.map((item) => ({
                        value: item.id,
                        label: item.name,
                    }))}
                    onChange={(value: number) => updateCharacterClass(value)}
                    value={classSelectOption}
                    style={{
                        width: "100%",
                    }}
                />
            </div>
            <div className={styles["controllers-info"]}>
                <Checkbox
                    checked={facetextureStore.modal.newFacetexture.data.visible}
                    onChange={(e) => updateCharacterShowClass(e)}
                >
                    Mostrar icone da classe
                </Checkbox>
            </div>
            <div className={styles["controllers-info"]}>
                <Title level={5}>
                    Facetexture do jogo
                    <Tooltip
                        title="Selecione a facetexture atual do personagem,
                                esse arquivo geralmente fica dentro da pasta Meus Documentos/Black Desert/Facetexture.
                                Essa é a imagem que aparece atualmente na sua tela de seleção de personagem."
                    >
                        <FontAwesomeIcon icon={faCircleInfo} />
                    </Tooltip>
                    :
                </Title>
                <Dragger
                    listType="picture-card"
                    beforeUpload={(file) => updateImageSelectedCharacter(file)}
                    fileList={[]}
                >
                    <div className={`${styles["upload-text"]} ${styles[theme]}`}>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                </Dragger>
                <div>Nome do arquivo: {facetextureStore.modal.newFacetexture.data.name}</div>
            </div>
        </Modal>
    );
};

export default NewModal;
