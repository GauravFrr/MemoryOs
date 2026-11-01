const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
  if (users.length > 0) {
    console.log('SUCCESS! Webhook worked. Users found:');
    console.log(users);
  } else {
    console.log('No users found in database yet. Waiting for webhook...');
  }
}).catch(console.error).finally(() => prisma.$disconnect());
