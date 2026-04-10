const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const dotenv = require('dotenv');
const { ValidationPipe } = require('@nestjs/common');
const { Test } = require('@nestjs/testing');
const { FastifyAdapter, NestFastifyApplication } = require('@nestjs/platform-fastify');
const fastifyCookie = require('@fastify/cookie');
const { AppModule } = require('../../dist/app.module');
const { PrismaService } = require('../../dist/infrastructure/database/prisma.service');
const { RedisService } = require('../../dist/infrastructure/redis/redis.service');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let app;
let fastify;
let originalFetch;

const inMemoryItems = [];
let idSequence = 1;

const prismaMock = {
    item: {
        async create({ data }) {
            const created = {
                id: idSequence++,
                name: data.name,
                description: data.description || null,
                createdAt: new Date(),
            };
            inMemoryItems.push(created);
            return created;
        },
        async findMany() {
            return [...inMemoryItems];
        },
        async findUnique({ where }) {
            return inMemoryItems.find((item) => item.id === where.id) || null;
        },
        async update({ where, data }) {
            const index = inMemoryItems.findIndex((item) => item.id === where.id);
            if (index < 0) {
                throw new Error('Record not found');
            }

            inMemoryItems[index] = {
                ...inMemoryItems[index],
                ...data,
            };

            return inMemoryItems[index];
        },
        async delete({ where }) {
            const index = inMemoryItems.findIndex((item) => item.id === where.id);
            if (index < 0) {
                throw new Error('Record not found');
            }

            const [deleted] = inMemoryItems.splice(index, 1);
            return deleted;
        },
    },
};

const redisStore = new Map();
const redisMock = {
    getClient() {
        return {
            async get(key) {
                return redisStore.get(key) || null;
            },
            async set(key, value) {
                redisStore.set(key, value);
                return 'OK';
            },
            async del(...keys) {
                let count = 0;
                for (const key of keys) {
                    if (redisStore.delete(key)) {
                        count += 1;
                    }
                }
                return count;
            },
        };
    },
};

async function request(options) {
    return fastify.inject(options);
}

test.before(async () => {
    originalFetch = global.fetch;

    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(PrismaService)
        .useValue(prismaMock)
        .overrideProvider(RedisService)
        .useValue(redisMock)
        .compile();

    app = moduleRef.createNestApplication(new FastifyAdapter());
    await app.register(fastifyCookie);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');

    await app.init();
    fastify = app.getHttpAdapter().getInstance();
});

test.after(async () => {
    global.fetch = originalFetch;

    if (app) {
        await app.close();
    }
});

test('GET /api returns health payload', async () => {
    const response = await request({ method: 'GET', url: '/api' });
    assert.equal(response.statusCode, 200);

    const payload = JSON.parse(response.body);
    assert.equal(payload.status, 'ok');
    assert.ok(payload.timestamp);
});

test('POST /api/auth/login with missing credential returns 400', async () => {
    const response = await request({
        method: 'POST',
        url: '/api/auth/login',
        payload: {},
    });

    assert.equal(response.statusCode, 400);

    const payload = JSON.parse(response.body);
    const messages = Array.isArray(payload.message) ? payload.message : [payload.message];
    assert.ok(messages.some((message) => String(message).includes('credential')));
});

test('items endpoints: create, list and delete item', async () => {
    const uniqueName = `e2e-item-${Date.now()}`;

    const createResponse = await request({
        method: 'POST',
        url: '/api/items',
        payload: {
            name: uniqueName,
            description: 'created by e2e',
        },
    });

    assert.equal(createResponse.statusCode, 201);
    const created = JSON.parse(createResponse.body);
    assert.equal(created.name, uniqueName);

    const listResponse = await request({ method: 'GET', url: '/api/items' });
    assert.equal(listResponse.statusCode, 200);
    const items = JSON.parse(listResponse.body);
    assert.ok(items.some((item) => item.id === created.id && item.name === uniqueName));

    const deleteResponse = await request({ method: 'DELETE', url: `/api/items/${created.id}` });
    assert.equal(deleteResponse.statusCode, 204);
});

test('GET /api/minecraft/profile/:username uses mocked Mojang response', async () => {
    global.fetch = async (url) => {
        const target = String(url);
        if (target.includes('api.mojang.com/users/profiles/minecraft/TestUser')) {
            return {
                ok: true,
                status: 200,
                json: async () => ({ id: 'abcd1234', name: 'TestUser' }),
            };
        }

        return originalFetch(url);
    };

    const response = await request({ method: 'GET', url: '/api/minecraft/profile/TestUser' });

    assert.equal(response.statusCode, 200);
    const payload = JSON.parse(response.body);
    assert.deepEqual(payload, {
        username: 'TestUser',
        uuid: 'abcd1234',
        skinUrl: 'https://mc-heads.net/avatar/abcd1234/128',
    });
});
