interface LoadingState {
    global: boolean;
    slices: Record<string, LoadingType>;
    effects: Record<string, LoadingType>;
    requests: Record<string, string[]>;
}
