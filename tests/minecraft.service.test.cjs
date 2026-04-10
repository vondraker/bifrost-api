const test = require('node:test');
const assert = require('node:assert/strict');
const { MinecraftService } = require('../dist/minecraft/minecraft.service');

const originalFetch = global.fetch;

test('MinecraftService.getProfile returns normalized response', async () => {
    global.fetch = async () => ({
        ok: true,
        status: 200,
        async json() {
            return { id: 'abcd1234', name: 'Steve' };
        },
    });

    const service = new MinecraftService();
    const profile = await service.getProfile('Steve');

    assert.deepEqual(profile, {
        username: 'Steve',
        uuid: 'abcd1234',
        skinUrl: 'https://mc-heads.net/avatar/abcd1234/128',
    });
});

test('MinecraftService.getProfile throws NotFoundException for missing user', async () => {
    global.fetch = async () => ({
        ok: false,
        status: 404,
    });

    const service = new MinecraftService();

    await assert.rejects(async () => {
        await service.getProfile('MissingUser');
    }, /doesn't exist/);
});

test.after(() => {
    global.fetch = originalFetch;
});
