import { RootState } from "@/lib/store";
import { createListenerMiddleware } from "@reduxjs/toolkit";

import { setLoading } from ".";
import { LoadingType } from "@/types/commonTypes";

export const LoadingMiddleware = createListenerMiddleware();

LoadingMiddleware.startListening({
    predicate: (action) => {
        const actionType: string = action.type;
        if (actionType === undefined) {
            return false;
        }

        const [_, reducer, lifecycle] = actionType.split("/");
        if (lifecycle === undefined || reducer === "setupLoading") {
            return false;
        }

        return ["pending", "fulfilled", "rejected"].indexOf(lifecycle) !== -1;
    },

    effect: async (action, listenerApi) => {
        const requestId: string = (action.meta as any).requestId;
        const actionType: string = action.type;
        const state = listenerApi.getState() as RootState;

        const [slice, reducer, lifecycle] = actionType.split("/");
        const effect = `${slice}/${reducer}`;

        const loading = _registerEffect({
            initialState: state.loading,
            slice,
            effect,
            lifecycle,
            requestId,
        });

        listenerApi.dispatch(setLoading(loading));
    },
});

interface EffectArgs {
    initialState: LoadingState;
    slice: string;
    effect: string;
    lifecycle: string;
    requestId: string;
}

export function _registerEffect(args: EffectArgs): LoadingState {
    const state = {
        global: args.initialState.global,
        slices: { ...args.initialState.slices },
        effects: { ...args.initialState.effects },
        requests: { ...args.initialState.requests },
    };

    if (!state.slices[args.slice]) {
        state.slices[args.slice] = "starting";
    }
    if (!state.effects[args.effect]) {
        state.effects[args.effect] = "starting";
    }
    if (!state.requests[args.effect]) {
        state.requests[args.effect] = [];
    }

    if (args.lifecycle === "pending") {
        state.global = true;
        state.slices[args.slice] = "pending";
        state.effects[args.effect] = "pending";
        state.requests[args.effect] = [...state.requests[args.effect], args.requestId];

        return state;
    }

    const loadingState: LoadingType = args.lifecycle === "rejected" ? "failed" : "idle";

    // cleanup requests/effects
    state.requests[args.effect] = state.requests[args.effect].filter((id) => id !== args.requestId);
    state.effects[args.effect] = state.requests[args.effect].length ? "pending" : loadingState;

    // cleanup slices
    const activeReqs = Object.keys(state.requests).filter((effect) => !!state.requests[effect].length);
    const activeSlices = activeReqs.map((item) => item.split("/")[0]);

    const slices = Object.keys(state.slices);
    for (let i = 0; i < slices.length; i += 1) {
        state.slices[slices[i]] = activeSlices.indexOf(slices[i]) !== -1 ? "pending" : loadingState;
    }

    // cleanup global
    state.global = !!activeSlices.length;

    return state;
}
