import { Inject, Injectable } from '@nestjs/common';
import {
  PROJECT_REPOSITORY,
  ProjectEntity,
  ProjectRepository,
} from '../domain/project.entity';
import { CreateProjectDto } from '../presentation/dto/create-project.dto';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(ownerId: string, dto: CreateProjectDto): Promise<ProjectEntity> {
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

    return this.projectRepository.create({
      ownerId,
      name: dto.name,
      description: dto.description || null,
      status: dto.status,
      startDate,
      endDate,
    });
  }
}
