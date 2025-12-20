
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Attempting to connect to database...');
    try {
        const categories = await prisma.category.findMany();
        console.log('Successfully fetched categories:', categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
