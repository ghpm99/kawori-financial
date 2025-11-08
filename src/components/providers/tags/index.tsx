import { fetchDetailTagService, fetchTagsService } from "@/services/financial";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";

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

    const { data, isLoading } = useQuery({
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
            const response = await fetchDetailTagService(detailTagId);
            return response.data;
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
        console.log(values);
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
