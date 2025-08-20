import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "antd";
import { MenuProps } from "antd/lib/menu";
import Link from "next/link";

const items: MenuProps["items"] = [
    {
        key: "1",
        label: <Link href={"/admin/user"}>Conta</Link>,
    },
    {
        key: "2",
        label: <div>Sair</div>,
        danger: true,
    },
];

const AccountMenuInfo = (props: IAccountMenuInfoProps) => {
    return (
        <Dropdown menu={{ items }}>
            <a onClick={(e) => e.preventDefault()}>
                <FontAwesomeIcon
                    icon={faUser}
                    style={{
                        marginRight: "6px",
                    }}
                />
                {props.user.name}
            </a>
        </Dropdown>
    );
};

export default AccountMenuInfo;
