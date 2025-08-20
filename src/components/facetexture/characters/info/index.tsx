import { PlusOutlined } from "@ant-design/icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Checkbox, Image, Select, Tooltip, Typography, Upload, message } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RcFile } from "antd/lib/upload";
import { useSelector } from "react-redux";

import {
    changeCharacterNameThunk,
    changeClassCharacterThunk,
    changeShowClassThunk,
    deleteCharacterThunk,
} from "@/services/facetexture";
import { updateFacetextureUrlReducer } from "@/lib/features/facetexture";
import { RootState } from "@/lib/store";
import { db } from "@/util/db";
import Styles from "./Info.module.scss";
import { useAppDispatch } from "@/lib/hooks";
import { FACETEXTURE_MESSAGE_REF } from "@/util";

const { Title } = Typography;

const Info = () => {
    const facetextureStore = useSelector((state: RootState) => state.facetexture);
    const dispatch = useAppDispatch();

    const updateCharacterClass = (id: number | undefined, value: number) => {
        if (id == undefined) {
            return;
        }

        message.loading({
            content: "Atualizando classe",
            key: FACETEXTURE_MESSAGE_REF,
        });

        dispatch(
            changeClassCharacterThunk({
                id: id,
                classId: value,
            }),
        )
            .then((value) => {
                if (value.type.includes("fulfilled")) {
                    message.success({
                        content: `Classe alterada para ${(value.payload as any).data.class.name}`,
                        key: FACETEXTURE_MESSAGE_REF,
                    });
                }
            })
            .catch((reason) => {
                message.error({
                    content: "Falhou em atualizar classe!",
                    key: FACETEXTURE_MESSAGE_REF,
                });
            });
    };

    const updateImageSelectedCharacter = (id: number | undefined, file: RcFile) => {
        if (id === undefined) {
            return;
        }
        message.loading({
            content: "Atualizando imagem",
            key: FACETEXTURE_MESSAGE_REF,
        });
        dispatch(
            updateFacetextureUrlReducer({
                id: id,
                image: URL.createObjectURL(file),
            }),
        );
        dispatch(
            changeCharacterNameThunk({
                id: id,
                name: file.name,
            }),
        )
            .then((value) => {
                if (value.type.includes("fulfilled")) {
                    message.success({
                        content: (value.payload as any).data.data,
                        key: FACETEXTURE_MESSAGE_REF,
                    });
                }
            })
            .catch((reason) => {
                message.error({
                    content: "Falhou em atualizar imagem!",
                    key: FACETEXTURE_MESSAGE_REF,
                });
            });
        updateImageLocal(file.name, file);
    };

    const updateImageLocal = async (name: string, file: Blob) => {
        const localImage = await db.image.filter((image) => image.name === name).first();

        if (localImage && localImage.id) {
            db.image.update(localImage.id, { imagem: file });
        } else {
            db.image.add({
                name: name,
                imagem: file,
            });
        }
    };

    const deleteCharacter = (id: number | undefined) => {
        if (!id) {
            return;
        }
        message.loading({
            content: "Excluindo personagem",
            key: FACETEXTURE_MESSAGE_REF,
        });
        dispatch(deleteCharacterThunk(id))
            .then((value) => {
                if (value.type.includes("fulfilled")) {
                    message.success({
                        content: (value.payload as any).data.data,
                        key: FACETEXTURE_MESSAGE_REF,
                    });
                }
            })
            .catch((reason) => {
                message.error({
                    content: "Falhou em excluir!",
                    key: FACETEXTURE_MESSAGE_REF,
                });
            });
    };

    const updateCharacterShowClass = (id: number | undefined, event: CheckboxChangeEvent) => {
        if (!id) {
            return;
        }
        message.loading({
            content: "Atualizando visibilidade de icone",
            key: FACETEXTURE_MESSAGE_REF,
        });
        dispatch(
            changeShowClassThunk({
                id: id,
                visible: event.target.checked,
            }),
        )
            .then((value) => {
                if (value.type.includes("fulfilled")) {
                    message.success({
                        content: (value.payload as any).data.data,
                        key: FACETEXTURE_MESSAGE_REF,
                    });
                }
            })
            .catch((reason) => {
                message.error({
                    content: "Falhou em atualizar!",
                    key: FACETEXTURE_MESSAGE_REF,
                });
            });
    };

    const selectedFacetexture =
        facetextureStore.selected !== undefined
            ? facetextureStore.facetexture.find((face) => face.id === facetextureStore.selected)
            : undefined;

    return (
        <div className={Styles["character-info"]}>
            {selectedFacetexture && (
                <>
                    <div className={Styles["controllers-info"]}>
                        <Title level={4}>Propriedades</Title>
                        <Title level={5}>
                            Imagem atual do personagem
                            <Tooltip
                                title="Essa é a imagem atual do seu personagem.
                                Caso ja tenha feito upload da imagem que fica em Meus Documentos/Black Desert/Facetexture
                                e essa imagem voltou para a padrao, não se preocupe, esse é um erro conhecido e será ajustado em breve.
                            "
                            >
                                <FontAwesomeIcon icon={faCircleInfo} />
                            </Tooltip>
                            :
                        </Title>
                        <Image
                            src={selectedFacetexture.image}
                            alt={selectedFacetexture.name}
                            width={125}
                            height={160}
                            className={Styles["character-image"]}
                        />
                    </div>
                    <div className={Styles["controllers-info"]}>
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
                            value={selectedFacetexture?.class.id}
                            style={{
                                width: "125px",
                            }}
                            onChange={(value: number) => updateCharacterClass(selectedFacetexture.id, value)}
                        />
                    </div>
                    <div className={Styles["controllers-info"]}>
                        <Checkbox
                            checked={selectedFacetexture?.show}
                            onChange={(e) => updateCharacterShowClass(selectedFacetexture.id, e)}
                        >
                            Mostrar icone da classe
                        </Checkbox>
                    </div>
                    <div className={Styles["controllers-info"]}>
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

                        <Upload
                            listType="picture-card"
                            beforeUpload={(file) => updateImageSelectedCharacter(selectedFacetexture.id, file)}
                            fileList={[]}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </div>
                    <div className={Styles["controllers-info"]}>
                        <Button type="primary" onClick={() => deleteCharacter(selectedFacetexture.id)}>
                            Deletar personagem
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Info;
