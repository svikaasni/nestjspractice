import { Inject, Injectable } from '@nestjs/common';
import {
  TASK_REPOSITORY,
  TaskEntity,
  TaskRepository,
} from '../domain/task.entity';
import { ListTasksQueryDto } from '../presentation/dto/list-tasks-query.dto';
import { PaginatedResult } from '../../projects/application/list-projects.use-case';

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(
    ownerId: string,
    query: ListTasksQueryDto,
  ): Promise<PaginatedResult<TaskEntity>> {
    const { page = 1, limit = 20, projectId, search, status, priority, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const { data, total } = await this.taskRepository.findManyForOwner(ownerId, {
      projectId,
      search,
      status,
      priority,
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
