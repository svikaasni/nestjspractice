import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { TaskPriority, TaskStatus } from '../../domain/task.entity';

export class ListTasksQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'projectId must be a valid UUID' })
  projectId?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be PENDING, IN_PROGRESS, or COMPLETED' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority?: TaskPriority;
}
