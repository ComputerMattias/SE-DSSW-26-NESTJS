import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DataModule } from '../data/data.module';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
