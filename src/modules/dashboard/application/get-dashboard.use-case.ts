import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { DashboardResponseDto } from '../presentation/dto/dashboard-response.dto';
import { ProjectStatus, TaskStatus } from '@prisma/client';

@Injectable()
export class GetDashboardUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(ownerId: string): Promise<DashboardResponseDto> {
    const [
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    ] = await Promise.all([
      // Total projects owned by the user
      this.prisma.project.count({
        where: { ownerId },
      }),
      // Total tasks belonging to projects owned by the user
      this.prisma.task.count({
        where: {
          project: { ownerId },
        },
      }),
      // Completed tasks
      this.prisma.task.count({
        where: {
          project: { ownerId },
          status: TaskStatus.COMPLETED,
        },
      }),
      // Pending tasks (strictly PENDING, not including IN_PROGRESS)
      this.prisma.task.count({
        where: {
          project: { ownerId },
          status: TaskStatus.PENDING,
        },
      }),
      // Projects in progress
      this.prisma.project.count({
        where: {
          ownerId,
          status: ProjectStatus.IN_PROGRESS,
        },
      }),
    ]);

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    };
  }
}
