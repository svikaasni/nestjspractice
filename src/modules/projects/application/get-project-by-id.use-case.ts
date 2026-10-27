import { Inject, Injectable } from '@nestjs/common';
import {
  PROJECT_REPOSITORY,
  ProjectEntity,
  ProjectRepository,
} from '../domain/project.entity';
import { ResourceNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GetProjectByIdUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(projectId: string, ownerId: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findByIdForOwner(projectId, ownerId);

    if (!project) {
      throw new ResourceNotFoundException('Project', projectId);
    }

    return project;
  }
}
