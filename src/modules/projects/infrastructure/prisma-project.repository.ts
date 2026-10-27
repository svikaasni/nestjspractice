import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  CreateProjectData,
  FindProjectsOptions,
  ProjectEntity,
  ProjectRepository,
  ProjectStatus,
  UpdateProjectData,
} from '../domain/project.entity';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateProjectData): Promise<ProjectEntity> {
    const project = await this.prisma.project.create({
      data: {
        ownerId: input.ownerId,
        name: input.name,
        description: input.description,
        status: input.status as any || ProjectStatus.NOT_STARTED,
        startDate: input.startDate,
        endDate: input.endDate,
      },
    });

    return this.mapToEntity(project);
  }

  async findByIdForOwner(projectId: string, ownerId: string): Promise<ProjectEntity | null> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId,
      },
    });

    return project ? this.mapToEntity(project) : null;
  }

  async findManyForOwner(
    ownerId: string,
    options: FindProjectsOptions,
  ): Promise<{ data: ProjectEntity[]; total: number }> {
    const where: Prisma.ProjectWhereInput = {
      ownerId,
      ...(options.status ? { status: options.status as any } : {}),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { description: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderByField = options.sortBy && ['name', 'createdAt', 'startDate', 'endDate', 'status'].includes(options.sortBy)
      ? options.sortBy
      : 'createdAt';

    const orderDirection = options.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: options.skip,
        take: options.limit,
        orderBy: {
          [orderByField]: orderDirection,
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: data.map(this.mapToEntity),
      total,
    };
  }

  async save(
    projectId: string,
    ownerId: string,
    input: UpdateProjectData,
  ): Promise<ProjectEntity> {
    const updated = await this.prisma.project.update({
      where: {
        id: projectId,
        ownerId,
      },
      data: {
        name: input.name,
        description: input.description,
        status: input.status as any,
        startDate: input.startDate,
        endDate: input.endDate,
      },
    });

    return this.mapToEntity(updated);
  }

  async deleteForOwner(projectId: string, ownerId: string): Promise<void> {
    await this.prisma.project.delete({
      where: {
        id: projectId,
        ownerId,
      },
    });
  }

  private mapToEntity(model: any): ProjectEntity {
    return {
      id: model.id,
      ownerId: model.ownerId,
      name: model.name,
      description: model.description,
      status: model.status as ProjectStatus,
      startDate: model.startDate,
      endDate: model.endDate,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
