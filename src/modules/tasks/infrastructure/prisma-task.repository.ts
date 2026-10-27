import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  CreateTaskData,
  FindTasksOptions,
  PatchTaskData,
  TaskEntity,
  TaskPriority,
  TaskRepository,
  TaskStatus,
  UpdateTaskData,
} from '../domain/task.entity';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateTaskData): Promise<TaskEntity> {
    const task = await this.prisma.task.create({
      data: {
        projectId: input.projectId,
        name: input.name,
        description: input.description,
        priority: input.priority as any || TaskPriority.MEDIUM,
        status: input.status as any || TaskStatus.PENDING,
        dueDate: input.dueDate,
      },
      include: {
        project: { select: { name: true } },
      },
    });

    return this.mapToEntity(task);
  }

  async findByIdForOwner(taskId: string, ownerId: string): Promise<TaskEntity | null> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId,
        },
      },
      include: {
        project: { select: { name: true } },
      },
    });

    return task ? this.mapToEntity(task) : null;
  }

  async findManyForOwner(
    ownerId: string,
    options: FindTasksOptions,
  ): Promise<{ data: TaskEntity[]; total: number }> {
    const where: Prisma.TaskWhereInput = {
      project: {
        ownerId,
      },
      ...(options.projectId ? { projectId: options.projectId } : {}),
      ...(options.status ? { status: options.status as any } : {}),
      ...(options.priority ? { priority: options.priority as any } : {}),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { description: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderByField = options.sortBy && ['name', 'createdAt', 'dueDate', 'priority', 'status'].includes(options.sortBy)
      ? options.sortBy
      : 'createdAt';

    const orderDirection = options.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: options.skip,
        take: options.limit,
        orderBy: {
          [orderByField]: orderDirection,
        },
        include: {
          project: { select: { name: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: data.map(this.mapToEntity),
      total,
    };
  }

  async save(taskId: string, input: UpdateTaskData): Promise<TaskEntity> {
    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        name: input.name,
        description: input.description,
        priority: input.priority as any,
        status: input.status as any,
        dueDate: input.dueDate,
      },
      include: {
        project: { select: { name: true } },
      },
    });

    return this.mapToEntity(task);
  }

  async patch(taskId: string, input: PatchTaskData): Promise<TaskEntity> {
    const data: Prisma.TaskUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.priority !== undefined) data.priority = input.priority as any;
    if (input.status !== undefined) data.status = input.status as any;
    if (input.dueDate !== undefined) data.dueDate = input.dueDate;

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        project: { select: { name: true } },
      },
    });

    return this.mapToEntity(task);
  }

  async delete(taskId: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  private mapToEntity(model: any): TaskEntity {
    return {
      id: model.id,
      projectId: model.projectId,
      name: model.name,
      description: model.description,
      priority: model.priority as TaskPriority,
      status: model.status as TaskStatus,
      dueDate: model.dueDate,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      projectName: model.project?.name,
    };
  }
}
