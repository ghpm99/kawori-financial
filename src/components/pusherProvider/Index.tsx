import Pusher from "pusher-js";
import { setPusherClient } from "react-pusher";

interface IPusherProviderProps {
    children: JSX.Element;
}

export default function PusherProvider({ children }: IPusherProviderProps) {
    const { data } = { data: { accessToken: "" } };
    const pusher = new Pusher(children.props.pusher_key, {
        cluster: children.props.pusher_cluster,
        authEndpoint: process.env.NEXT_PUBLIC_API_URL + "/admin-api/pusher/auth",
        auth: { headers: { Authorization: `Basic ${data?.accessToken}` } },
    });

    setPusherClient(pusher);

    return children;
}

export async function getServerSideProps() {
    const pusher = {
        key: process.env.PUSHER_KEY,
        cluster: process.env.PUSHER_CLUSTER,
    };
    return { pusher };
}
