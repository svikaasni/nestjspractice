import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PatchTaskDto } from './dto/patch-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { CreateTaskUseCase } from '../application/create-task.use-case';
import { ListTasksUseCase } from '../application/list-tasks.use-case';
import { GetTaskByIdUseCase } from '../application/get-task-by-id.use-case';
import { UpdateTaskUseCase } from '../application/update-task.use-case';
import { PatchTaskUseCase } from '../application/patch-task.use-case';
import { DeleteTaskUseCase } from '../application/delete-task.use-case';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly patchTaskUseCase: PatchTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.createTaskUseCase.execute(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @CurrentUser('userId') userId: string,
    @Query() query: ListTasksQueryDto,
  ) {
    return this.listTasksUseCase.execute(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ) {
    return this.getTaskByIdUseCase.execute(id, userId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.updateTaskUseCase.execute(id, userId, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async patch(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() dto: PatchTaskDto,
  ) {
    return this.patchTaskUseCase.execute(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ) {
    await this.deleteTaskUseCase.execute(id, userId);
  }
}
