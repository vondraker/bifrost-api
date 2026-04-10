import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    try {
        await prisma.$connect();
        console.log('Connected to database!');
        const items = await prisma.item.findMany();
        console.log('Items:', items);
        await prisma.$disconnect();
    } catch (e) {
        console.error('Connection failed:', e);
        process.exit(1);
    }
}

main();
