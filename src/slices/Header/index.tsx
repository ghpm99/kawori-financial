import { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { Divider } from "antd";
import styles from "./header.module.scss";

/**
 * Props for `Header`.
 */
export type HeaderProps = SliceComponentProps<Content.HeaderSlice>;

/**
 * Component for "Header" Slices.
 */
const Header = ({ slice }: HeaderProps): JSX.Element => {
    return (
        <section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
            <div className={styles["primary"]}>
                <PrismicRichText field={slice.primary.title} />
                {slice.primary.illustration && <PrismicNextImage field={slice.primary.illustration} />}
            </div>

            {slice.items.map((item, i) => (
                <div key={i}>
                    <PrismicRichText field={item.sub_title} />
                    <PrismicRichText field={item.description} />
                    <Divider />
                </div>
            ))}
        </section>
    );
};

export default Header;
