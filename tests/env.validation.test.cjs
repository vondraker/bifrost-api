const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEnv } = require('../dist/config/env.validation');

test('validateEnv returns defaults for optional values', () => {
    const result = validateEnv({
        DATABASE_URL: 'postgresql://localhost:5432/bifrost',
        JWT_SECRET: 'secret',
        GOOGLE_CLIENT_ID: 'client-id',
    });

    assert.equal(result.NODE_ENV, 'development');
    assert.equal(result.REDIS_URL, 'redis://localhost:6379');
    assert.equal(result.DATABASE_URL, 'postgresql://localhost:5432/bifrost');
});

test('validateEnv throws when required keys are missing', () => {
    assert.throws(() => {
        validateEnv({
            DATABASE_URL: 'postgresql://localhost:5432/bifrost',
            GOOGLE_CLIENT_ID: 'client-id',
        });
    }, /JWT_SECRET/);
});
