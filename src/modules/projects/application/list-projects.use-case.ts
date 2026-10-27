import { Inject, Injectable } from '@nestjs/common';
import {
  PROJECT_REPOSITORY,
  ProjectEntity,
  ProjectRepository,
} from '../domain/project.entity';
import { ListProjectsQueryDto } from '../presentation/dto/list-projects-query.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(
    ownerId: string,
    query: ListProjectsQueryDto,
  ): Promise<PaginatedResult<ProjectEntity>> {
    const { page = 1, limit = 20, search, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const { data, total } = await this.projectRepository.findManyForOwner(ownerId, {
      search,
      status,
      skip,
      limit,
      sortBy,
      sortOrder: sortOrder?.toLowerCase() as 'asc' | 'desc',
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
