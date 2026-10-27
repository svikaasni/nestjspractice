import { PrismaClient, ProjectStatus, TaskPriority, TaskStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.session.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash('TestPassword!2026', {
    type: argon2.argon2id,
  });

  // Create User A
  const userA = await prisma.user.create({
    data: {
      fullName: 'Test User A',
      email: 'usera@example.test',
      passwordHash,
    },
  });

  // Create User B
  const userB = await prisma.user.create({
    data: {
      fullName: 'Test User B',
      email: 'userb@example.test',
      passwordHash,
    },
  });

  // User A Projects
  const projectA1 = await prisma.project.create({
    data: {
      ownerId: userA.id,
      name: 'Inventory Platform',
      description: 'Backend engineering assessment project',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-10-19'),
      endDate: new Date('2026-12-15'),
    },
  });

  const projectA2 = await prisma.project.create({
    data: {
      ownerId: userA.id,
      name: 'Payment Integration',
      description: 'Stripe and PayPal gateway implementation',
      status: ProjectStatus.NOT_STARTED,
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  // User A Tasks in Project A1
  await prisma.task.createMany({
    data: [
      {
        projectId: projectA1.id,
        name: 'Implement authentication',
        description: 'Add registration, login and session revocation',
        priority: TaskPriority.HIGH,
        status: TaskStatus.COMPLETED,
        dueDate: new Date('2026-11-05'),
      },
      {
        projectId: projectA1.id,
        name: 'Build project CRUD endpoints',
        description: 'Enforce ownership isolation and DTO validation',
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2026-11-12'),
      },
      {
        projectId: projectA1.id,
        name: 'Add Postman collection',
        description: 'Export collection with automated isolation test scripts',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date('2026-11-20'),
      },
    ],
  });

  // User B Project
  const projectB1 = await prisma.project.create({
    data: {
      ownerId: userB.id,
      name: 'Mobile Client v2',
      description: 'Android application companion for project management',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-01'),
    },
  });

  // User B Tasks
  await prisma.task.create({
    data: {
      projectId: projectB1.id,
      name: 'Set up Retrofit API Client',
      description: 'Call the NestJS API with Bearer token authentication',
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date('2026-11-15'),
    },
  });

  console.log('✅ Seeding completed:');
  console.log(`- User A: ${userA.email} (Password: TestPassword!2026)`);
  console.log(`- User B: ${userB.email} (Password: TestPassword!2026)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
