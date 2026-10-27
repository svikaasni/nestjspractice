import { Module } from '@nestjs/common';
import { DashboardController } from './presentation/dashboard.controller';
import { GetDashboardUseCase } from './application/get-dashboard.use-case';

@Module({
  controllers: [DashboardController],
  providers: [GetDashboardUseCase],
})
export class DashboardModule {}
