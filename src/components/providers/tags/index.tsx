import { createContext, useContext, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";

import { fetchDetailTagService, fetchTagsService, saveTagService } from "@/services/financial/tag";

const messageKey = "tag_pagination_message";

export interface ITags {
    id: number;
    name: string;
    color: string;
    total_payments: number;
    total_value: number;
    total_open: number;
    total_closed: number;
    is_budget: boolean;
}

type TagsContextValue = {
    data: ITags[];
    loading: boolean;
    openDrawer: boolean;
    handleOnOpenDrawer: (id?: number) => void;
    handleOnCloseDrawer: () => void;
    tagDetails: ITags;
    isLoadingTagDetails: boolean;
    onUpdateTagDetail: (values: ITags) => void;
};

const TagsContext = createContext<TagsContextValue | undefined>(undefined);

export const TagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [detailTagId, setDetailTagId] = useState<number | undefined>(undefined);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["tags"],
        queryFn: async () => {
            const response = await fetchTagsService();
            return response.data;
        },
    });

    const { data: tagDetails, isLoading: isLoadingTagDetails } = useQuery({
        queryKey: ["tags-details", detailTagId],
        enabled: !!detailTagId,
        queryFn: async () => {
            const response = await fetchDetailTagService(detailTagId!);
            return response.data;
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (tag: ITags) => {
            const response = await saveTagService(tag);
            return response.data;
        },
        onSuccess: (data) => {
            message.success({
                content: data.msg,
                key: messageKey,
            });
            refetch();
        },
    });

    const handleOnOpenDrawer = (id?: number) => {
        setDetailTagId(id);
        setOpenDrawer(true);
    };

    const handleOnCloseDrawer = () => {
        setOpenDrawer(false);
    };

    const onUpdateTagDetail = (values: ITags) => {
        mutate(values);
    };
    return (
        <TagsContext.Provider
            value={{
                data: data || [],
                loading: isLoading,
                openDrawer,
                handleOnOpenDrawer,
                handleOnCloseDrawer,
                tagDetails: tagDetails || ({} as ITags),
                isLoadingTagDetails,
                onUpdateTagDetail,
            }}
        >
            {children}
        </TagsContext.Provider>
    );
};

export const useTags = (): TagsContextValue => {
    const ctx = useContext(TagsContext);
    if (!ctx) throw new Error("useTags must be used within TagsProvider");
    return ctx;
};
