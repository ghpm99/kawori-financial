import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
    changeClassCharacterThunk,
    changeShowClassThunk,
    deleteCharacterThunk,
    fetchFaceTextureClassService,
    fetchFacetextureService,
    newCharacterThunk,
    reorderCharacterThunk,
} from "@/services/facetexture";

const initialState: IFacetextureState = {
    loading: true,
    backgroundUrl: "",
    class: [],
    facetexture: [],
    selected: undefined,
    edited: false,
    error: false,
    modal: {
        newFacetexture: {
            visible: false,
            saving: false,
            data: {
                name: "",
                visible: true,
                classId: 0,
            },
        },
    },
};

export const fetchFacetexture = createAsyncThunk("facetexture/fetchFacetexture", async () => {
    const classes = await fetchFaceTextureClassService();
    const response = await fetchFacetextureService();
    const characters = response.characters.map((item) => ({
        ...item,
        image: item.class.class_image,
    }));
    return { characters, classes };
});

export const facetextureSlice = createSlice({
    name: "facetexture",
    initialState,
    reducers: {
        updateFacetextureUrlReducer: (state: IFacetextureState, action: PayloadAction<IUpdateFacetextureUrlAction>) => {
            const index = state.facetexture.findIndex((face) => face.id === action.payload.id);
            state.facetexture[index].image = action.payload.image;
        },
        updateBackgroundReducer: (state: IFacetextureState, action: PayloadAction<string>) => {
            state.backgroundUrl = action.payload;
        },
        setSelectedFacetextureReducer: (state: IFacetextureState, action: PayloadAction<number>) => {
            state.selected = action.payload;
        },
        reorderCharacterReducer: (state: IFacetextureState, action: PayloadAction<IReorderCharacterAction>) => {
            const newFacetextureList = state.facetexture.filter((item, index) => index !== action.payload.indexSource);
            newFacetextureList.splice(
                action.payload.indexDestination,
                0,
                state.facetexture[action.payload.indexSource],
            );
            state.facetexture = newFacetextureList;
        },
        updateFacetextureClassModalReducer: (
            state: IFacetextureState,
            action: PayloadAction<IUpdateCharacterClassAction>,
        ) => {
            state.modal.newFacetexture.data.classId = action.payload.classId;
        },
        deleteCharacterReducer: (state: IFacetextureState, action: PayloadAction<number>) => {
            const newFacetextureList = state.facetexture.filter((_, index) => index !== action.payload);
            state.facetexture = newFacetextureList;
            state.edited = true;
        },
        updateFacetextureVisibleClassModalReducer: (
            state: IFacetextureState,
            action: PayloadAction<IUpdateCharacterVisibleClassAction>,
        ) => {
            state.modal.newFacetexture.data.visible = action.payload.visible;
        },
        setFacetextureIsEdited: (state: IFacetextureState, action: PayloadAction<boolean>) => {
            state.edited = action.payload;
        },
        updateFacetextureImageNameModalReducer: (
            state: IFacetextureState,
            action: PayloadAction<IUpdateCharacterImageNameAction>,
        ) => {
            state.modal.newFacetexture.data.name = action.payload.name;
        },
        changeModalVisible: (state: IFacetextureState, action: PayloadAction<changeModalVisible>) => {
            state.modal[action.payload.modal].visible = action.payload.visible;
        },
        changeFacetextureSavingModalReducer: (state: IFacetextureState, action: PayloadAction<boolean>) => {
            state.modal.newFacetexture.saving = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFacetexture.pending, (state) => {
                state.loading = true;
                state.error = false;
            })
            .addCase(fetchFacetexture.fulfilled, (state, action) => {
                state.class = action.payload.classes.class;
                state.facetexture = action.payload.characters;
                state.loading = false;
            })
            .addCase(fetchFacetexture.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
            })
            .addCase(changeClassCharacterThunk.fulfilled, (state, action) => {
                const facetextureIndex = state.facetexture.findIndex((item) => item.id === action.payload.id);
                state.facetexture[facetextureIndex].class = action.payload.data.class;
                state.facetexture[facetextureIndex].image = action.payload.data.class.class_image;
            })
            .addCase(deleteCharacterThunk.fulfilled, (state, action) => {
                state.facetexture = state.facetexture.filter((facetexture) => facetexture.id !== action.payload.id);
            })
            .addCase(reorderCharacterThunk.pending, (state, action) => {
                const indexSource = state.facetexture.findIndex((item) => item.id === action.meta.arg.id);
                const newFacetextureList = state.facetexture.filter((item) => item.id !== action.meta.arg.id);
                newFacetextureList.splice(action.meta.arg.indexDestination, 0, state.facetexture[indexSource]);
                state.facetexture = newFacetextureList;
            })
            .addCase(reorderCharacterThunk.fulfilled, (state, action) => {
                const dataPayload = action.payload.data;
                for (const index in dataPayload) {
                    const data = dataPayload[index];
                    const indexTarget = state.facetexture.findIndex((facetexture) => facetexture.id === data.id);
                    if (indexTarget >= 0) {
                        state.facetexture[indexTarget].order = data.order;
                        state.facetexture.sort((a, b) => a.order - b.order);
                    }
                }
            })
            .addCase(newCharacterThunk.pending, (state) => {
                state.modal.newFacetexture.saving = true;
            })
            .addCase(newCharacterThunk.fulfilled, (state, action) => {
                state.modal.newFacetexture.saving = false;
                state.modal.newFacetexture.visible = false;
                state.facetexture.push(action.payload.character);
                state.modal.newFacetexture.data = initialState.modal.newFacetexture.data;
            })
            .addCase(newCharacterThunk.rejected, (state) => {
                state.modal.newFacetexture.saving = false;
            })
            .addCase(changeShowClassThunk.fulfilled, (state, action) => {
                const facetextureTarget = state.facetexture.find((facetexture) => facetexture.id === action.payload.id);
                if (!facetextureTarget) {
                    return;
                }
                facetextureTarget.show = action.payload.visible;
            });
    },
});

export const {
    updateFacetextureUrlReducer,
    updateBackgroundReducer,
    setSelectedFacetextureReducer,
    reorderCharacterReducer,
    updateFacetextureClassModalReducer,
    deleteCharacterReducer,
    updateFacetextureVisibleClassModalReducer,
    setFacetextureIsEdited,
    updateFacetextureImageNameModalReducer,
    changeModalVisible,
    changeFacetextureSavingModalReducer,
} = facetextureSlice.actions;

export default facetextureSlice.reducer;
