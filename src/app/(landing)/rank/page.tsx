"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAllBdoClass, getAnswerByClass, getAnswerSummary, getTotalVotes } from "@/services/classification";
import { normalizeString } from "@/util";
import { Rate, Statistic, Tooltip, Typography } from "antd";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip as ChartTooltip,
} from "chart.js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useInView } from "react-intersection-observer";
import styles from "./rank.module.scss";
import { AnswerSummaryData } from "@/lib/features/classification";
import Image from "next/image";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    ChartTooltip,
    Legend,
);

const NoData = () => <div className={styles["no-data"]}>Sem dados</div>;

const { Text, Title: AntdTitle } = Typography;

const Rank = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const dispatch = useAppDispatch();
    const configurationStore = useAppSelector((state) => state.configuration);
    const classificationStore = useAppSelector((state) => state.classification);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

    const [answerSummary, setAnswerSummary] = useState<AnswerSummaryData | undefined>(undefined);

    const classIdParams = searchParams.get("classId");

    useEffect(() => {
        document.title = "Ranking de Classes - Resultados de Votação";
        dispatch(getAllBdoClass());
        // dispatch(getTotalVotes());
        dispatch(getAnswerByClass());
        dispatch(getAnswerSummary());
    }, []);

    useEffect(() => {
        const classId = parseInt(classIdParams);
        if (Number.isNaN(classId)) {
            return;
        }
        setSelectedClassId(classId);
    }, [classIdParams]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams],
    );

    const classWithVotesList = classificationStore.votesByClass.filter((item) => item.data > 0);

    const dataset = [
        {
            label: "# Total de voto por classe",
            data: classWithVotesList.map((item) => item.data),
            backgroundColor: classWithVotesList.map((item) => item.color),
        },
    ];

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Distribuição de Votos por Classe",
            },
        },
    };

    const dataSource = {
        labels: classWithVotesList.map((item) => item.label),
        datasets: dataset,
    };

    const { ref, inView, entry } = useInView({
        /* Optional options */
        threshold: 0,
        delay: 2,
    });

    const { ref: selectedClassRef, inView: selectedClassInView } = useInView({
        threshold: 0,
        delay: 2,
    });

    const selectedClass = configurationStore.class.find((bdoClass) => bdoClass.id === selectedClassId);

    const normalizedName = normalizeString(selectedClass?.name || "");

    useEffect(() => {
        if (selectedClass) {
            setAnswerSummary(classificationStore.answerSummary.find((item) => item.bdo_class === selectedClass.id));
        } else {
            setAnswerSummary(undefined);
        }
    }, [selectedClass?.id, classificationStore?.answerSummary?.length]);

    const awakeningAnswerSummary = (() => {
        if (!answerSummary || !answerSummary.resume["1"]) {
            return <NoData />;
        }
        const resume = answerSummary.resume["1"];
        return resume.map((item, index) => (
            <div key={index} className={`${styles["answer-container"]} ${styles["awakening-container"]}`}>
                <div>{item.text}</div>
                <Rate disabled value={item.avg_votes} tooltips={[String(item.avg_votes)]} allowHalf />
            </div>
        ));
    })();

    const successionAnswerSummary = (() => {
        if (!answerSummary || !answerSummary.resume["2"]) {
            return <NoData />;
        }
        const resume = answerSummary.resume["2"];
        return resume.map((item, index) => (
            <div key={index} className={`${styles["answer-container"]} ${styles["succession-container"]}`}>
                <div>{item.text}</div>
                <Rate disabled value={item.avg_votes} />
            </div>
        ));
    })();

    return (
        <div>
            <AntdTitle>Ranking de Classes</AntdTitle>
            <Text>
                Bem-vindo à página de resultados de votação de classes! Aqui você pode ver a distribuição dos votos e
                escolher a sua classe favorita para visualizar os detalhes.
            </Text>
            {/* <Statistic title="Total de votos" value={classificationStore.totalVotes} /> */}
            <div className={styles["votes-pie"]}>
                <Pie data={dataSource} options={options} width={400} style={{ background: "white", height: "100%" }} />
            </div>
            {selectedClass && (
                <div
                    className={`${styles["selected-class"]} ${selectedClassInView ? styles["on-class"] : undefined}`}
                    ref={selectedClassRef}
                >
                    <h2
                        className={styles["title"]}
                        style={{
                            color: selectedClass.color,
                        }}
                    >
                        {selectedClass.abbreviation}
                    </h2>
                    <div className={`${styles["awakening"]}  ${styles[normalizedName]}`}>
                        <div className={styles["grid-container"]}>
                            <div className={styles["left-container"]}></div>
                            <div className={styles["right-container"]}>
                                <h3
                                    className={styles["title"]}
                                    style={{
                                        color: selectedClass.color,
                                    }}
                                >
                                    DESPERTAR
                                </h3>
                                <div className={styles["awakening-summary"]}>{awakeningAnswerSummary}</div>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles["succession"]}  ${styles[normalizedName]}`}>
                        <div className={styles["grid-container"]}>
                            <div className={styles["left-container"]}>
                                <h3
                                    className={styles["title"]}
                                    style={{
                                        color: selectedClass.color,
                                    }}
                                >
                                    SUCESSÃO
                                </h3>
                                <div className={styles["succession-summary"]}>{successionAnswerSummary}</div>
                            </div>
                            <div className={styles["right-container"]}></div>
                        </div>
                    </div>
                </div>
            )}
            <div className={styles["bdo-class-title"]}>
                <h2 className={styles["title"]}>Escolher Classe</h2>
                <h4 className={styles["subtitle"]}>
                    Escolha a classe abaixo para visualizar os resultados detalhados dos votos.
                </h4>
            </div>
            <ul className={`${styles["bdo-class-list"]} ${inView ? styles["on"] : undefined}`} ref={ref}>
                {configurationStore.class.map((bdoClass, index) => (
                    <li
                        key={bdoClass.id}
                        className={styles["bdo-class"]}
                        style={{
                            transitionDelay: `${index * 0.08}s`,
                        }}
                    >
                        <div
                            onClick={() => {
                                router.push(pathname + "?" + createQueryString("classId", bdoClass.id.toString()));
                            }}
                            className={styles["class-wrap"]}
                        >
                            <div className={styles["bdo-class-name"]}>
                                <Image
                                    width={50}
                                    height={50}
                                    alt={`${bdoClass.name}-symbol`}
                                    src={bdoClass.class_symbol}
                                    className={`${styles["bdo-class-symbol"]}`}
                                />
                                {bdoClass.abbreviation}
                            </div>
                            <Image
                                width={240}
                                height={330}
                                alt={`${bdoClass.name}-image`}
                                src={bdoClass.class_image}
                                className={`${styles["bdo-class-image"]}`}
                            />
                        </div>
                    </li>
                ))}
            </ul>
            <Text>
                Obrigado por participar da votação! Sua opinião é muito importante para nós e ajuda outras pessoas a
                saberem como está a sua classe.
            </Text>
            <br />
            <Text>Continue votando e ajudando a comunidade.</Text>
        </div>
    );
};

const ComponentWrapper = () => (
    <Suspense>
        <Rank />
    </Suspense>
);

export default ComponentWrapper;
