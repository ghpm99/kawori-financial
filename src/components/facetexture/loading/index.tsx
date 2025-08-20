import { Breadcrumb, Skeleton } from "antd";
import SkeletonImage from "antd/lib/skeleton/Image";
import Styles from "./Loading.module.scss";

const Loading = () => {
    return (
        <>
            <Breadcrumb className={Styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Facetexture</Breadcrumb.Item>
            </Breadcrumb>
            <div className={Styles["container-toolkit"]}>
                <div className={Styles["characters"]}>
                    <div>
                        <h1>Personagens</h1>
                        <SkeletonImage />
                    </div>
                    <div className={Styles["character-info"]}>
                        <Skeleton />
                    </div>
                </div>
                <div className={Styles["background-container"]}>
                    <h1>Background</h1>
                    <div>
                        <SkeletonImage />
                    </div>
                </div>
                <div className={Styles["preview-container"]}>
                    <h1>Preview</h1>
                    <div>
                        <SkeletonImage />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Loading;
