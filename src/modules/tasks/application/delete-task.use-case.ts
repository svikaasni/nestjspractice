import { Inject, Injectable } from '@nestjs/common';
import {
  TASK_REPOSITORY,
  TaskRepository,
} from '../domain/task.entity';
import { ResourceNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(taskId: string, ownerId: string): Promise<void> {
    const existing = await this.taskRepository.findByIdForOwner(taskId, ownerId);
    if (!existing) {
      throw new ResourceNotFoundException('Task', taskId);
    }

    await this.taskRepository.delete(taskId);
  }
}
