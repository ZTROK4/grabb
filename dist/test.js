"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function test() {
    const now = await prisma.$queryRaw `SELECT NOW()`;
    console.log("DB Time:", now);
}
test()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=test.js.map