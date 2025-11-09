export declare const env: {
    nodeEnv: string;
    port: number;
    frontendOrigin: string;
    apiOrigin: string;
    cookieDomain: string;
    googleClientId: string;
    googleClientSecret: string;
    sessionSecret: string;
    pg: {
        user: string;
        host: string;
        database: string;
        password: string;
        port: number;
    };
};
export declare function buildPostgresConnectionString(): string;
//# sourceMappingURL=env.d.ts.map