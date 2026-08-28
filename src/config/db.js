const prisma = require('./prisma');

async function main() {
    await prisma.$connect();
}

module.exports = main;

