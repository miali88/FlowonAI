import { PrismaClient } from '@prisma/client'; // Example using Prisma, replace with your ORM or database client

const prisma = new PrismaClient();

export async function fetchAgentsFromDatabase() {
  try {
    // Replace this with your actual database query
    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return agents;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw new Error('Failed to fetch agents from database');
  }
}
