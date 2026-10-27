import { Inject, Injectable } from '@nestjs/common';
import {
  PROJECT_REPOSITORY,
  ProjectEntity,
  ProjectRepository,
} from '../domain/project.entity';
import { UpdateProjectDto } from '../presentation/dto/update-project.dto';
import {
  DomainException,
  ResourceNotFoundException,
} from '../../../common/exceptions/domain.exception';

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(
    projectId: string,
    ownerId: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectEntity> {
    const existing = await this.projectRepository.findByIdForOwner(projectId, ownerId);
    if (!existing) {
      throw new ResourceNotFoundException('Project', projectId);
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : null;
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    if (startDate && endDate && endDate < startDate) {
      throw new DomainException(
        'Project end date cannot precede start date',
        'INVALID_DATE_RANGE',
        400,
        { startDate: dto.startDate, endDate: dto.endDate },
      );
    }

    return this.projectRepository.save(projectId, ownerId, {
      name: dto.name,
      description: dto.description || null,
      status: dto.status,
      startDate,
      endDate,
    });
  }
}
