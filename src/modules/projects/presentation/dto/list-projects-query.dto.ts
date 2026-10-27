import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { ProjectStatus } from '../../domain/project.entity';

export class ListProjectsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Status must be NOT_STARTED, IN_PROGRESS, or COMPLETED' })
  status?: ProjectStatus;
}
