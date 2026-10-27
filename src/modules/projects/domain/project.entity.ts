export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface ProjectEntity {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  ownerId: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface UpdateProjectData {
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface FindProjectsOptions {
  search?: string;
  status?: ProjectStatus;
  skip: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectRepository {
  create(input: CreateProjectData): Promise<ProjectEntity>;
  findByIdForOwner(projectId: string, ownerId: string): Promise<ProjectEntity | null>;
  findManyForOwner(ownerId: string, options: FindProjectsOptions): Promise<{ data: ProjectEntity[]; total: number }>;
  save(projectId: string, ownerId: string, input: UpdateProjectData): Promise<ProjectEntity>;
  deleteForOwner(projectId: string, ownerId: string): Promise<void>;
}

export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';
