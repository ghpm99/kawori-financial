
const axios = {
    get: jest.fn((url) => {
        if (url === '/something') {
            return Promise.resolve({
                data: 'data'
            });
        } else {
            return Promise.reject(new Error("URL não suportada"));
        }
    }),
    post: jest.fn((url: string, data) => {
        if (url === "/signup") {
            return Promise.resolve({
                data: { msg: "Usuário criado com sucesso" },
            });
        } else if (url === "/token/") {
            return Promise.resolve({
                data: { tokens: { access: "access_token", refresh: "refresh_token" } },
            });
        } else {
            return Promise.reject(new Error("URL não suportada"));
        }
    }),
    create: jest.fn(function () {
        return this;
    }),
    interceptors: {
        request: {
            use: jest.fn(),
        },
        response: {
            use: jest.fn(),
        },
    },
};

module.exports = axios;