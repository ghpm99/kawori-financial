export interface pagination {
    current_page: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
}

type PageAuth = {
    role: string;
    loading: JSX.Element;
    unauthorized: string;
};

type PagePusher = {
    name: string;
};

type NextPageCustom<P = {}, IP = P> = NextPage<P, IP> & {
    auth?: PageAuth;
    pusher?: PagePusher;
};

type LoadingType = "starting" | "idle" | "pending" | "succeeded" | "failed";
