type EnvShape = {
    NODE_ENV?: string;
    PORT?: string;
    NEST_PORT?: string;
    DATABASE_URL: string;
    REDIS_URL?: string;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
};

function mustHave(input: Record<string, unknown>, key: keyof EnvShape): string {
    const value = input[key] as string | undefined;
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required environment variable: ${String(key)}`);
    }
    return value;
}

export function validateEnv(input: Record<string, unknown>): EnvShape {
    return {
        NODE_ENV: (input.NODE_ENV as string | undefined) || 'development',
        PORT: input.PORT as string | undefined,
        NEST_PORT: input.NEST_PORT as string | undefined,
        DATABASE_URL: mustHave(input, 'DATABASE_URL'),
        REDIS_URL: (input.REDIS_URL as string | undefined) || 'redis://localhost:6379',
        JWT_SECRET: mustHave(input, 'JWT_SECRET'),
        GOOGLE_CLIENT_ID: mustHave(input, 'GOOGLE_CLIENT_ID'),
    };
}
