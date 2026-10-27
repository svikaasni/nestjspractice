import { Module } from '@nestjs/common';
import { TasksController } from './presentation/tasks.controller';
import { CreateTaskUseCase } from './application/create-task.use-case';
import { ListTasksUseCase } from './application/list-tasks.use-case';
import { GetTaskByIdUseCase } from './application/get-task-by-id.use-case';
import { UpdateTaskUseCase } from './application/update-task.use-case';
import { PatchTaskUseCase } from './application/patch-task.use-case';
import { DeleteTaskUseCase } from './application/delete-task.use-case';
import { PrismaTaskRepository } from './infrastructure/prisma-task.repository';
import { TASK_REPOSITORY } from './domain/task.entity';

@Module({
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    ListTasksUseCase,
    GetTaskByIdUseCase,
    UpdateTaskUseCase,
    PatchTaskUseCase,
    DeleteTaskUseCase,
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [TASK_REPOSITORY],
})
export class TasksModule {}
