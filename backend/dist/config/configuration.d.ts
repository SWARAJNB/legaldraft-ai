declare const _default: () => {
    port: number;
    database: {
        url: string;
    };
    ai: {
        geminiApiKey: string | undefined;
    };
    jwt: {
        secret: string;
    };
    storage: {
        bucketName: string | undefined;
        region: string | undefined;
    };
};
export default _default;
