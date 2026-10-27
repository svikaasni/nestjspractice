export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface TaskEntity {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  projectName?: string;
}

export interface CreateTaskData {
  projectId: string;
  name: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date | null;
}

export interface UpdateTaskData {
  name: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date | null;
}

export interface PatchTaskData {
  name?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date | null;
}

export interface FindTasksOptions {
  projectId?: string;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  skip: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskRepository {
  create(input: CreateTaskData): Promise<TaskEntity>;
  findByIdForOwner(taskId: string, ownerId: string): Promise<TaskEntity | null>;
  findManyForOwner(ownerId: string, options: FindTasksOptions): Promise<{ data: TaskEntity[]; total: number }>;
  save(taskId: string, input: UpdateTaskData): Promise<TaskEntity>;
  patch(taskId: string, input: PatchTaskData): Promise<TaskEntity>;
  delete(taskId: string): Promise<void>;
}

export const TASK_REPOSITORY = 'TASK_REPOSITORY';
