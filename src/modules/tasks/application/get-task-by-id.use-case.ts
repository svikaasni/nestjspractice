import { Inject, Injectable } from '@nestjs/common';
import {
  TASK_REPOSITORY,
  TaskEntity,
  TaskRepository,
} from '../domain/task.entity';
import { ResourceNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GetTaskByIdUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(taskId: string, ownerId: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findByIdForOwner(taskId, ownerId);

    if (!task) {
      throw new ResourceNotFoundException('Task', taskId);
    }

    return task;
  }
}
