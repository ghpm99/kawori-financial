import { IUserData } from "@/components/providers/user";
import { apiDjango } from "..";
import { apiAuth } from "../auth";

export const userDetailService = () => {
    const response = apiDjango.get<IUserData>("profile/");
    return response;
};

export const userGroupsService = () => {
    const response = apiDjango.get<{ data: string[] }>("profile/groups/");
    return response;
};
