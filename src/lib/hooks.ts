import { Action, ThunkDispatch } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";

import { AppDispatch, AppStore, RootState } from "./store";

export type ThunkAppDispatch = ThunkDispatch<RootState, void, Action>;
export const useAppThunkDispatch = (): ThunkAppDispatch => useDispatch<ThunkAppDispatch>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
