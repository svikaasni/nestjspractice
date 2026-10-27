import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProjectStatus } from '../../domain/project.entity';

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Project name must not be empty' })
  @MinLength(1)
  @MaxLength(150, { message: 'Project name cannot exceed 150 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @IsEnum(ProjectStatus, { message: 'Status must be NOT_STARTED, IN_PROGRESS, or COMPLETED' })
  status!: ProjectStatus;

  @IsOptional()
  @IsDateString({ strict: false }, { message: 'Start date must be a valid ISO date string (YYYY-MM-DD)' })
  startDate?: string;

  @IsOptional()
  @IsDateString({ strict: false }, { message: 'End date must be a valid ISO date string (YYYY-MM-DD)' })
  endDate?: string;
}
