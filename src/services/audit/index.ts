import { apiDjango } from "@/services";

export type AuditResult = "success" | "failure" | "error";

export type AuditReportFilters = {
    category?: string;
    action?: string;
    result?: AuditResult;
    user_id?: number | string;
    username?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
};

export type AuditReportData = {
    filters: {
        category?: string;
        action?: string;
        result?: AuditResult;
        user_id?: number | string;
        username?: string;
        date_from?: string;
        date_to?: string;
        limit?: number;
    };
    summary: {
        total_events: number;
        unique_users: number;
        success_events: number;
        failure_events: number;
        error_events: number;
    };
    interactions_by_day: Array<{ day: string; count: number }>;
    by_action: Array<{ action: string; count: number }>;
    by_category: Array<{ category: string; count: number }>;
    by_user: Array<{ username: string; user_id: number | string; count: number }>;
    failures_by_action: Array<{ action: string; count: number }>;
};

const cleanFilters = (filters: AuditReportFilters): AuditReportFilters => {
    const params: AuditReportFilters = {};

    if (filters.category) {
        params.category = filters.category;
    }
    if (filters.action) {
        params.action = filters.action;
    }
    if (filters.result) {
        params.result = filters.result;
    }
    if (filters.user_id !== undefined && filters.user_id !== null && filters.user_id !== "") {
        params.user_id = filters.user_id;
    }
    if (filters.username) {
        params.username = filters.username;
    }
    if (filters.date_from) {
        params.date_from = filters.date_from;
    }
    if (filters.date_to) {
        params.date_to = filters.date_to;
    }

    const rawLimit = Number(filters.limit);
    if (!isNaN(rawLimit)) {
        params.limit = Math.min(Math.max(rawLimit, 1), 100);
    }

    return params;
};

export const fetchAuditReportService = async (filters: AuditReportFilters) => {
    const response = await apiDjango.get<{ data: AuditReportData }>("/audit/report/", {
        params: cleanFilters(filters),
    });
    return response.data.data;
};
