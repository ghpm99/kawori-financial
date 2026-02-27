import { useEffect, useState } from "react";

import { Result } from "antd";
import { useRouter } from "next/navigation";

const COUNTDOWN_SECONDS = 15;

const SuccessStep = () => {
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    router.push("/signin");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <Result
            status="success"
            title="Senha redefinida com sucesso!"
            subTitle={`Você será redirecionado para o login em ${countdown}s...`}
        />
    );
};

export default SuccessStep;
