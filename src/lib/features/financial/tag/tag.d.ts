interface ITagStore {
    data: ITags[];
    loading: boolean;
    modal: IModalTags;
}

interface ITags {
    id: number;
    name: string;
    color: string;
    total_payments: number;
    total_value: number;
    total_open: number;
    total_closed: number;
    is_budget: boolean;
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
