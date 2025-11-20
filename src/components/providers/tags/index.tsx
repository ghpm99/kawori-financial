import { createContext, useContext, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";

import { fetchDetailTagService, fetchTagsService, saveTagService } from "@/services/financial";

const messageKey = "tag_pagination_message";

type TagsContextValue = {
    data: ITags[];
    loading: boolean;
    openDrawer: boolean;
    handleOnOpenDrawer: (id?: number) => void;
    handleOnCloseDrawer: () => void;
    tagDetails: ITag;
    isLoadingTagDetails: boolean;
    onUpdateTagDetail: (values: ITag) => void;
};

const TagsContext = createContext<TagsContextValue | undefined>(undefined);

export const TagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [detailTagId, setDetailTagId] = useState(undefined);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["tags"],
        queryFn: async () => {
            const response = await fetchTagsService();
            const tags = response.data;
            if (!tags) return [];

            return tags
                .sort((a: ITags, b: ITags) => a.name.localeCompare(b.name) && Number(b.is_budget) - Number(a.is_budget))
                .map((tag) => ({
                    ...tag,
                    name: tag.is_budget ? `# ${tag.name}` : tag.name,
                }));
        },
    });

    const { data: tagDetails, isLoading: isLoadingTagDetails } = useQuery({
        queryKey: ["tags-details", detailTagId],
        enabled: !!detailTagId,
        queryFn: async () => {
            const response = await fetchDetailTagService(detailTagId);
            return response.data;
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (tag: ITag) => {
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

    const onUpdateTagDetail = (values: ITag) => {
        mutate(values);
    };
    return (
        <TagsContext.Provider
            value={{
                data,
                loading: isLoading,
                openDrawer,
                handleOnOpenDrawer,
                handleOnCloseDrawer,
                tagDetails,
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
