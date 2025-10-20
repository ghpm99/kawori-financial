import { apiDjango } from ".";

export const fetchNewUsersAnalytics = () => {
    const response = apiDjango.get("/analytics/new-users/");
    return response;
};
