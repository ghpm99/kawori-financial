"use client";
import { Breadcrumb, Card, Layout, Rate, Table, Typography } from "antd";

import Loading from "@/components/facetexture/loading";
import Styles from "./rank.module.scss";

import { setSelectedMenu } from "@/lib/features/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAllAnswers } from "@/services/classification";
import Link from "next/link";
import { useEffect } from "react";
import { formatterDetailedDate } from "@/util";

const RANK_MESSAGE_REF = "rank-message-ref";
const { Title, Text } = Typography;

function Rank() {
    const dispatch = useAppDispatch();
    const classificationStore = useAppSelector((state) => state.classification);

    useEffect(() => {
        document.title = "Kawori Rank";
        dispatch(setSelectedMenu(["rank"]));
        dispatch(getAllAnswers());
    }, []);

    const combatStyleText = (combatStyle: number) => {
        switch (combatStyle) {
            case 1:
                return "Despertar";
            case 2:
                return "Sucessão";
            default:
                return "Desconhecido";
        }
    };

    return (
        <>
            <Breadcrumb className={Styles["breadcrumb"]}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Rank de classes</Breadcrumb.Item>
            </Breadcrumb>
            <div className={Styles["container-toolkit"]}>
                <Layout>
                    <div className={Styles["help-text"]}>
                        Deseja votar em alguma classe?
                        <Link className={Styles["hiper-link"]} href="/internal/rank/vote">
                            <strong>Clique aqui</strong>
                        </Link>
                    </div>
                    <div className={Styles["text"]}>
                        <Title>Rank de Classes</Title>
                        <Text>
                            Bem-vindo(a) à página de ranking de classes! Nesta página, você pode dar sua opinião sobre
                            sua classe e compartilhar sua visão de jogo.
                        </Text>
                        <br />
                        <Text>
                            Para votar, basta{" "}
                            <Link className={Styles["hiper-link"]} href="/internal/rank/vote">
                                <strong>clicar aqui!</strong>
                            </Link>
                        </Text>
                        <br />
                        <Text>
                            Após enviar seu voto, ele será analisado e processado, o que pode levar algum tempo.
                        </Text>
                        <br />
                        <Text>
                            Caso vote novamente na mesma classe e no mesmo estilo de combate de um voto já realizado, o
                            voto antigo será editado.
                        </Text>
                    </div>
                    <Table
                        title={() => "Meus ultimos votos"}
                        columns={[
                            {
                                title: "Questao",
                                dataIndex: "question",
                                key: "question",
                            },
                            {
                                title: "Voto",
                                dataIndex: "vote",
                                key: "vote",
                                render: (vote) => {
                                    return <Rate disabled value={vote} />;
                                },
                            },
                            {
                                title: "Classe",
                                dataIndex: "bdo_class",
                                key: "bdo_class",
                                render: (bdo_class, object) => {
                                    return (
                                        <div>
                                            {bdo_class} - {combatStyleText(object.combat_style)}
                                        </div>
                                    );
                                },
                            },
                            {
                                title: "Dia do voto",
                                dataIndex: "created_at",
                                key: "created_at",
                                render: (value) => {
                                    return <div>{formatterDetailedDate(value)}</div>;
                                },
                            },
                        ]}
                        dataSource={classificationStore.answers}
                    />
                </Layout>
            </div>
        </>
    );
}

Rank.auth = {
    role: "user",
    loading: <Loading />,
    unauthorized: "/signin",
};

export default Rank;
