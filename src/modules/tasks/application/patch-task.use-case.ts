import { Inject, Injectable } from '@nestjs/common';
import {
  TASK_REPOSITORY,
  TaskEntity,
  TaskRepository,
} from '../domain/task.entity';
import { PatchTaskDto } from '../presentation/dto/patch-task.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class PatchTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(
    taskId: string,
    ownerId: string,
    dto: PatchTaskDto,
  ): Promise<TaskEntity> {
    const existing = await this.taskRepository.findByIdForOwner(taskId, ownerId);
    if (!existing) {
      throw new ResourceNotFoundException('Task', taskId);
    }

    const dueDate = dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined;

    return this.taskRepository.patch(taskId, {
      name: dto.name,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      dueDate,
    });
  }
}
