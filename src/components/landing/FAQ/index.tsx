import { Collapse, CollapseProps } from "antd";

const items: CollapseProps["items"] = [
    {
        key: "1",
        label: "Como eu utilizo o site?",
        children: (
            <p>
                Para utilizar o site, você deve se cadastrar e fazer o login. Após fazer o login, você terá acesso a
                todas as funcionalidades do site.
            </p>
        ),
    },
    {
        key: "2",
        label: "Quanto custa para utilizar o site?",
        children: <p>O site é gratuito para todos os usuários. Não cobramos nenhuma taxa de utilização.</p>,
    },
    {
        key: "3",
        label: "Utilizar o site é seguro?",
        children: (
            <p>
                Sim, o site é seguro. Utilizamos as melhores práticas de segurança para proteger os dados dos nossos
                usuários. Além disso, não compartilhamos informações pessoais com terceiros.
            </p>
        ),
    },
    {
        key: "4",
        label: "Como faço para entrar em contato com o suporte?",
        children: (
            <p>
                Para entrar em contato com o suporte, entre no nosso grupo do discord atraves do link:
                <a href="https://discord.gg/fykNkXyn2r">Kawori Site</a>
            </p>
        ),
    },
];

const FAQ = () => {
    return <Collapse items={items} />;
};

export default FAQ;
