import { Inject, Injectable } from '@nestjs/common';
import {
  TASK_REPOSITORY,
  TaskEntity,
  TaskRepository,
} from '../domain/task.entity';
import { UpdateTaskDto } from '../presentation/dto/update-task.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(
    taskId: string,
    ownerId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    const existing = await this.taskRepository.findByIdForOwner(taskId, ownerId);
    if (!existing) {
      throw new ResourceNotFoundException('Task', taskId);
    }

    const dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

    return this.taskRepository.save(taskId, {
      name: dto.name,
      description: dto.description || null,
      priority: dto.priority,
      status: dto.status,
      dueDate,
    });
  }
}
