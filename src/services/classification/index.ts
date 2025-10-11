import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiDjango } from "..";
import { AxiosError } from "axios";

interface AnswerData {
    question_id: number;
    bdo_class_id: number;
    combat_style: number;
    vote: number;
}

export const getAllQuestions = createAsyncThunk("classification/getAllQuestions", async () => {
    const response = await apiDjango.get("/classification/get-question/");
    return response.data;
});

export const getAllAnswers = createAsyncThunk("classification/getAllAnswers", async () => {
    const response = await apiDjango.get("/classification/get-answer/");
    return response.data;
});

export const registerAnswer = createAsyncThunk(
    "classification/registerAnswer",
    async ({ answerData }: { answerData: AnswerData }, { rejectWithValue }) => {
        try {
            const response = await apiDjango.post("/classification/register-answer/", answerData);
            return response.data;
        } catch (error) {
            const msg_error = ((error as AxiosError).response.data as { msg: string }).msg ?? "Falhou em salvar voto!";
            return rejectWithValue(msg_error);
        }
    },
);

export const getAllBdoClass = createAsyncThunk("classification/getAllBdoClass", async () => {
    const response = await apiDjango.get("/classification/get-class/");
    return response.data;
});

export const getTotalVotes = createAsyncThunk("classification/totalVotes", async () => {
    const response = await apiDjango.get("/classification/total-votes/");
    return response.data;
});

export const getAnswerByClass = createAsyncThunk("classification/answerByClass", async () => {
    const response = await apiDjango.get(`/classification/answer-by-class/`);
    return response.data;
});

export const getAnswerSummary = createAsyncThunk("classification/answerSummary", async () => {
    const response = await apiDjango.get(`/classification/get-answer-summary/`);
    return response.data;
});
