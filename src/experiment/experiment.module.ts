import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExperimentController } from './experiment.controller';
import { ExperimentService } from './experiment.service';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [ExperimentController],
  providers: [ExperimentService],
})
export class ExperimentModule {}
