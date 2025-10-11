"use client";
import { Breadcrumb, Button, Card, Layout } from "antd";

import Styles from "./vote.module.scss";

import Question from "@/components/rank/question";
import { setSelectedMenu } from "@/lib/features/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAllBdoClass, getAllQuestions } from "@/services/classification";
import { useEffect, useState } from "react";
import Intro from "@/components/rank/intro";
import styles from "./vote.module.scss";
import Finished from "@/components/rank/finished";

const RANK_MESSAGE_REF: string = "rank-message-ref";

const desc = ["Horrivel", "Mal", "Normal", "Bom", "Perfeito"];

function Vote() {
    const dispatch = useAppDispatch();
    const classificationStore = useAppSelector((state) => state.classification);

    const [activePanel, setActivePanel] = useState(0);

    useEffect(() => {
        document.title = "Kawori Rank - Votar";
        dispatch(setSelectedMenu(["rank"]));
        dispatch(getAllQuestions());
        dispatch(getAllBdoClass());
    }, []);

    const nextQuestion = () => {
        setActivePanel((prev) => ++prev);
    };

    const previousQuestion = () => {
        if (activePanel === 0) {
            return;
        }
        setActivePanel((prev) => --prev);
    };

    const finished = activePanel > classificationStore.questions.length;
    const hasPrevious = activePanel > 0;

    return (
        <>
            <Breadcrumb className={Styles["breadcrumb"]}>
                <Breadcrumb.Item href="/">Kawori</Breadcrumb.Item>
                <Breadcrumb.Item href="/internal/rank">Rank de classes</Breadcrumb.Item>
                <Breadcrumb.Item>Votar</Breadcrumb.Item>
                {classificationStore.selectedBdoClass && (
                    <Breadcrumb.Item>{classificationStore.selectedBdoClass.class.abbreviation}</Breadcrumb.Item>
                )}
            </Breadcrumb>
            <div className={Styles["vote-page"]}>
                <div className={Styles["panel"]}>
                    {activePanel === 0 && (
                        <div className={styles["question"]}>
                            <Intro nextQuestion={nextQuestion} bdoClass={classificationStore.class} />
                        </div>
                    )}

                    {classificationStore.questions.map(
                        (question, index) =>
                            activePanel === index + 1 && (
                                <div key={question.id} className={styles["question"]}>
                                    <Question
                                        question={question}
                                        text={desc}
                                        hasPrevious={hasPrevious}
                                        extra={`${index + 1}/${classificationStore.questions.length}`}
                                        selectedBdoClass={classificationStore.selectedBdoClass}
                                        nextQuestion={nextQuestion}
                                        previousQuestion={previousQuestion}
                                    />
                                </div>
                            ),
                    )}
                    {finished && (
                        <div className={styles["question"]}>
                            <Finished />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Vote;
