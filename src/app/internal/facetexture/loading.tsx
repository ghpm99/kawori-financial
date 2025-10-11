import { Breadcrumb, Skeleton } from "antd";
import Styles from "./Facetexture.module.scss";
import SkeletonImage from "antd/lib/skeleton/Image";

const Loading = () => (
    <>
        <Breadcrumb
            className={Styles["breadcrumb"]}
            items={[{ href: "/", title: "Home" }, { title: "Kawori" }, { title: "Facetexture" }]}
        />
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

export default Loading;
