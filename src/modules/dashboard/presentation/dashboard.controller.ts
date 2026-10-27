import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { GetDashboardUseCase } from '../application/get-dashboard.use-case';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getDashboard(@CurrentUser('userId') userId: string) {
    return this.getDashboardUseCase.execute(userId);
  }
}
