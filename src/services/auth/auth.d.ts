interface ILoginForm {
    username: string;
    password: string;
    remember: boolean;
    captchaToken: string;
}

interface IChangePasswordRequest {
    new_password: string;
    re_new_password: string;
}
