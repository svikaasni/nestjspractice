import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../../domain/task.entity';

export class PatchTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150, { message: 'Task name cannot exceed 150 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be PENDING, IN_PROGRESS, or COMPLETED' })
  status?: TaskStatus;

  @IsOptional()
  @IsDateString({ strict: false }, { message: 'Due date must be a valid ISO date string (YYYY-MM-DD)' })
  dueDate?: string;
}
