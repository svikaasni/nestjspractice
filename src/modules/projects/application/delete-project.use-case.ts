import { Inject, Injectable } from '@nestjs/common';
import {
  PROJECT_REPOSITORY,
  ProjectRepository,
} from '../domain/project.entity';
import { ResourceNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(projectId: string, ownerId: string): Promise<void> {
    const existing = await this.projectRepository.findByIdForOwner(projectId, ownerId);
    if (!existing) {
      throw new ResourceNotFoundException('Project', projectId);
    }

    await this.projectRepository.deleteForOwner(projectId, ownerId);
  }
}
