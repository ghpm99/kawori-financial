import { IUserData } from "@/components/providers/user";

import { apiDjango } from "..";

export interface IEmailPreferences {
    allow_all_emails: boolean;
    allow_notification: boolean;
    allow_promotional: boolean;
}

export const userDetailService = () => {
    const response = apiDjango.get<IUserData>("profile/");
    return response;
};

export const userGroupsService = () => {
    const response = apiDjango.get<{ data: string[] }>("profile/groups/");
    return response;
};

export const getEmailPreferencesService = () => {
    return apiDjango.get<IEmailPreferences>("mailer/preferences/");
};

export const updateEmailPreferencesService = (data: Partial<IEmailPreferences>) => {
    return apiDjango.put<IEmailPreferences>("mailer/preferences/", data);
};
