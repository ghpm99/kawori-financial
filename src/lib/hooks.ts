import { useDispatch } from "react-redux";
import { AppDispatch, AppStore, RootState } from "./store";
import { Action, ThunkDispatch } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { useStore } from "react-redux";

export type ThunkAppDispatch = ThunkDispatch<RootState, void, Action>;
export const useAppThunkDispatch = (): ThunkAppDispatch => useDispatch<ThunkAppDispatch>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
