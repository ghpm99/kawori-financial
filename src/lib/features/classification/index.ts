import {
    getAllAnswers,
    getAllBdoClass,
    getAllQuestions,
    getAnswerByClass,
    getAnswerSummary,
    getTotalVotes,
} from "@/services/classification";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QuestionData {
    id: number;
    question_text: string;
    question_details: string;
    pub_date: string;
    vote: number | undefined;
}

interface AnswerData {
    id: number;
    question: string;
    vote: number;
    bdo_class: string;
    combat_style: number;
    created_at: string;
}

export type ClassProfile = 1 | 2;

export type SelectedClass = {
    class: IClass;
    profile: ClassProfile;
};

type SelectedClassAction = {
    class: number;
    profile: ClassProfile;
};

type IVotesByClass = {
    label: string;
    data: number;
    color: string;
};

type AnswerSummary = {
    text: string;
    details: string;
    avg_votes: number;
};

export type AnswerSummaryData = {
    id: number;
    bdo_class: number;
    updated_at: string;
    resume: {
        [key: number]: AnswerSummary[];
    };
};

interface ClassificationState {
    questions: QuestionData[];
    answers: AnswerData[];
    class: IClass[];
    selectedBdoClass: SelectedClass | undefined;
    totalVotes: number;
    votesByClass: IVotesByClass[];
    answerSummary: AnswerSummaryData[];
}

const initialState: ClassificationState = {
    questions: [],
    answers: [],
    class: [],
    selectedBdoClass: undefined,
    totalVotes: 0,
    votesByClass: [],
    answerSummary: [],
};

export const classificationSlice = createSlice({
    name: "classification",
    initialState,
    reducers: {
        setQuestionVote: (state: ClassificationState, action: PayloadAction<{ id: number; vote: number }>) => {
            const questionSource = state.questions.findIndex((question) => question.id === action.payload.id);
            if (questionSource === -1) return;
            state.questions[questionSource].vote = action.payload.vote;
        },
        setSelectedBdoClass: (state: ClassificationState, action: PayloadAction<SelectedClassAction>) => {
            const targetBdoClass = state.class.find((bdoClass) => bdoClass.id === action.payload.class);
            const selectedClass: SelectedClass = {
                class: targetBdoClass,
                profile: action.payload.profile,
            };
            state.selectedBdoClass = selectedClass;

            state.questions = state.questions.map((question) => ({
                ...question,
                vote: undefined,
            }));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllQuestions.fulfilled, (state, action) => {
                state.questions = action.payload.data;
            })
            .addCase(getAllAnswers.fulfilled, (state, action) => {
                state.answers = action.payload.data;
            })
            .addCase(getAllBdoClass.fulfilled, (state, action) => {
                state.class = action.payload.class;
            })
            .addCase(getTotalVotes.fulfilled, (state, action) => {
                state.totalVotes = action.payload.total_votes;
            })
            .addCase(getAnswerByClass.fulfilled, (state, action) => {
                const payload = action.payload.data;
                state.votesByClass = payload.map((item) => ({
                    label: item.class,
                    data: item.answers_count,
                    color: item.color,
                }));
            })
            .addCase(getAnswerSummary.fulfilled, (state, action) => {
                state.answerSummary = action.payload.data;
            });
    },
});

export const { setQuestionVote, setSelectedBdoClass } = classificationSlice.actions;

export default classificationSlice.reducer;
