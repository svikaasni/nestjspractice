import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  TASK_REPOSITORY,
  TaskEntity,
  TaskRepository,
} from '../domain/task.entity';
import { CreateTaskDto } from '../presentation/dto/create-task.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(ownerId: string, dto: CreateTaskDto): Promise<TaskEntity> {
    // Enforce that parent project exists and belongs to the authenticated user
    const project = await this.prisma.project.findFirst({
      where: {
        id: dto.projectId,
        ownerId,
      },
    });

    if (!project) {
      throw new ResourceNotFoundException('Project', dto.projectId);
    }

    const dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

    return this.taskRepository.create({
      projectId: dto.projectId,
      name: dto.name,
      description: dto.description || null,
      priority: dto.priority,
      status: dto.status,
      dueDate,
    });
  }
}
