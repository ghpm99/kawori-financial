interface ITagStore {
    data: ITags[];
    loading: boolean;
    modal: IModalTags;
}

interface ITags {
    id: number;
    name: string;
    color: string;
}

interface IModalTags {
    newTag: {
        visible: boolean;
        error: boolean;
        errorMsg: string;
    };
}

type PayloadChangeVisibleModalTagsAction = {
    modal: keyof IModalTags;
    visible: boolean;
};
