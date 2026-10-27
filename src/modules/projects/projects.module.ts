import { Module } from '@nestjs/common';
import { ProjectsController } from './presentation/projects.controller';
import { CreateProjectUseCase } from './application/create-project.use-case';
import { ListProjectsUseCase } from './application/list-projects.use-case';
import { GetProjectByIdUseCase } from './application/get-project-by-id.use-case';
import { UpdateProjectUseCase } from './application/update-project.use-case';
import { DeleteProjectUseCase } from './application/delete-project.use-case';
import { PrismaProjectRepository } from './infrastructure/prisma-project.repository';
import { PROJECT_REPOSITORY } from './domain/project.entity';

@Module({
  controllers: [ProjectsController],
  providers: [
    CreateProjectUseCase,
    ListProjectsUseCase,
    GetProjectByIdUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
  ],
  exports: [PROJECT_REPOSITORY, CreateProjectUseCase, GetProjectByIdUseCase],
})
export class ProjectsModule {}
