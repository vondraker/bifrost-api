const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { AuthService } = require('../dist/auth/auth.service');

function createConfigService() {
    return {
        get(key) {
            const map = {
                GOOGLE_CLIENT_ID: 'google-client-id',
                JWT_SECRET: 'test-secret',
            };
            return map[key];
        },
    };
}

test('AuthService.getCurrentUser returns decoded user from JWT cookie token', () => {
    const service = new AuthService(createConfigService());
    const token = jwt.sign(
        { userId: 'u1', email: 'u1@example.com', name: 'U One', picture: 'avatar.png' },
        'test-secret',
        { expiresIn: '1h' },
    );

    const user = service.getCurrentUser(token);

    assert.deepEqual(user, {
        id: 'u1',
        email: 'u1@example.com',
        name: 'U One',
        picture: 'avatar.png',
    });
});

test('AuthService.getCurrentUser throws for invalid token', () => {
    const service = new AuthService(createConfigService());

    assert.throws(() => {
        service.getCurrentUser('invalid-token');
    }, /Invalid or expired token/);
});
