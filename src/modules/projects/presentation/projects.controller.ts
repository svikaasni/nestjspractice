import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';
import { CreateProjectUseCase } from '../application/create-project.use-case';
import { ListProjectsUseCase } from '../application/list-projects.use-case';
import { GetProjectByIdUseCase } from '../application/get-project-by-id.use-case';
import { UpdateProjectUseCase } from '../application/update-project.use-case';
import { DeleteProjectUseCase } from '../application/delete-project.use-case';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.createProjectUseCase.execute(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @CurrentUser('userId') userId: string,
    @Query() query: ListProjectsQueryDto,
  ) {
    return this.listProjectsUseCase.execute(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ) {
    return this.getProjectByIdUseCase.execute(id, userId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.updateProjectUseCase.execute(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ) {
    await this.deleteProjectUseCase.execute(id, userId);
  }
}
