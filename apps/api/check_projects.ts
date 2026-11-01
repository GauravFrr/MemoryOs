import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => ({ id: u.id, clerkId: u.clerkId, email: u.email })));
  
  const projects = await prisma.project.findMany();
  console.log('Projects:', projects.map(p => ({ id: p.id, name: p.name, userId: p.userId })));
  
  const memories = await prisma.memory.findMany();
  console.log('Memories:', memories.map(m => ({ id: m.id, content: m.content, projectId: m.projectId, userId: m.userId })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
