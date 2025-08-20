import { QuestionData, SelectedClass, setQuestionVote } from "@/lib/features/classification";
import { useAppDispatch } from "@/lib/hooks";
import { Button, Card, message, Rate } from "antd";
import styles from "./question.module.scss";
import { CaretLeftOutlined, CaretRightOutlined, FastForwardOutlined } from "@ant-design/icons";
import { registerAnswer } from "@/services/classification";
import { isFulfilled, isRejected } from "@reduxjs/toolkit";

interface IQuestionProps {
    question: QuestionData;
    text: string[];
    hasPrevious: boolean;
    extra: string;
    selectedBdoClass: SelectedClass;
    nextQuestion: () => void;
    previousQuestion: () => void;
}

const RANK_MESSAGE_REF: string = "rank-message-ref";

const Question = ({
    question,
    text,
    hasPrevious,
    extra,
    selectedBdoClass,
    nextQuestion,
    previousQuestion,
}: IQuestionProps) => {
    const dispatch = useAppDispatch();

    const setVote = (value: number) => {
        dispatch(
            setQuestionVote({
                id: question.id,
                vote: value,
            }),
        );
    };

    const skipQuestion = () => {
        message.info({
            content: "Questão pulada",
            key: RANK_MESSAGE_REF,
        });
        nextQuestion();
    };

    const voteQuestion = () => {
        dispatch(
            registerAnswer({
                answerData: {
                    bdo_class_id: selectedBdoClass.class.id,
                    combat_style: selectedBdoClass.profile,
                    question_id: question.id,
                    vote: question.vote,
                },
            }),
        ).then((action) => {
            if (isFulfilled(action)) {
                message.success({
                    content: action.payload.msg,
                    key: RANK_MESSAGE_REF,
                });
                nextQuestion();
            } else if (isRejected(action)) {
                message.error({
                    content: action.payload as string,
                    key: RANK_MESSAGE_REF,
                });
            }
        });
    };

    return (
        <>
            <Card
                title={<h2 className={styles["question-title"]}>{question.question_text}</h2>}
                actions={[
                    <>
                        <Button disabled={!hasPrevious} onClick={previousQuestion}>
                            <CaretLeftOutlined />
                            Anterior
                        </Button>
                    </>,
                    <>
                        <Button onClick={skipQuestion}>
                            Pular
                            <FastForwardOutlined />
                        </Button>
                    </>,
                    <>
                        <Button type="primary" onClick={voteQuestion}>
                            Proximo
                            <CaretRightOutlined />
                        </Button>
                    </>,
                ]}
                extra={extra}
            >
                <div
                    className={styles["question-details"]}
                    dangerouslySetInnerHTML={{
                        __html: question.question_details,
                    }}
                ></div>
                <Rate tooltips={text} onChange={setVote} value={question.vote} />
                {question.vote ? <div>{text[question.vote - 1]}</div> : null}
            </Card>
        </>
    );
};

export default Question;
