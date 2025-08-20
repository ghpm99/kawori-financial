import { InboxOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { RcFile } from "antd/lib/upload";
import Dragger from "antd/lib/upload/Dragger";
import { useSelector } from "react-redux";

import { updateBackgroundReducer } from "@/lib/features/facetexture";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { db } from "@/util/db";
import styles from "./Background.module.scss";
import { Theme } from "@/styles/theme";
import Image from "next/image";

const Background = ({ theme }: { theme: Theme }) => {
    const facetextureStore = useSelector((state: RootState) => state.facetexture);
    const dispatch = useAppDispatch();

    const uploadNewBackground = async (file: RcFile) => {
        const firstBackground = (await db.background.toArray())[0];
        db.background.update(firstBackground.id ?? 0, {
            image: file,
        });
        const backgroundUrl = URL.createObjectURL(file);
        dispatch(updateBackgroundReducer(backgroundUrl));
    };

    return (
        <div className={`${styles["background-container"]} ${styles[theme]}`}>
            <h1>Background</h1>
            <div>
                {facetextureStore.backgroundUrl !== "" && (
                    <Image
                        className={styles["background"]}
                        width={920}
                        height={997}
                        src={facetextureStore.backgroundUrl}
                        alt={"background"}
                    />
                )}
                <ImgCrop showReset rotationSlider aspect={920 / 997}>
                    <Dragger fileList={[]} beforeUpload={uploadNewBackground} maxCount={1}>
                        <div>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className={`ant-upload-text ${styles["text"]} ${styles[theme]}`}>
                                Clique ou arraste o arquivo para esta área para fazer upload
                            </p>
                            <p className={`ant-upload-hint ${styles["hint"]} ${styles[theme]}`}>
                                Suporte para upload único
                            </p>
                        </div>
                    </Dragger>
                </ImgCrop>
            </div>
        </div>
    );
};

export default Background;
