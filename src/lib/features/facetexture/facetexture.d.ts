interface IFacetextureState {
    loading: boolean;
    class: IClass[];
    facetexture: IFacetexture[];
    selected?: number;
    backgroundUrl: string;
    edited: boolean;
    error: boolean;
    modal: IFacetextureModalState;
}

interface IClass {
    id: number;
    name: string;
    abbreviation: string;
    class_image: string;
    class_symbol: string;
    color?: string;
}

interface IFacetexture {
    id: number;
    name: string;
    class: {
        id: number;
        name: string;
        abbreviation: string;
        class_image: string;
    };
    show: boolean;
    image: string;
    order: number;
}

interface IFacetextureModalState {
    newFacetexture: INewFacetextureModal;
}

interface INewFacetextureModal {
    visible: boolean;
    saving: boolean;
    data: INewFacetextureData;
}

interface INewFacetextureData {
    name: string;
    classId: number;
    visible: boolean;
}

interface IReorderCharacterAction {
    indexSource: number;
    indexDestination: number;
}

interface IUpdateFacetextureUrlAction {
    id: number;
    image: string;
}

interface IUpdateCharacterClassAction {
    classId: number;
}

interface IUpdateCharacterVisibleClassAction {
    visible: boolean;
}

interface IUpdateCharacterImageNameAction {
    name: string;
}

type changeModalVisible = {
    modal: keyof IFacetextureModalState;
    visible: boolean;
};
