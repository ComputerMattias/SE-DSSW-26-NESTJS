import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CandidatesModule } from './candidates/candidates.module';
import { DataModule } from './data/data.module';
import { ExperimentModule } from './experiment/experiment.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    DataModule,
    AuthModule,
    CandidatesModule,
    SessionsModule,
    MeasurementsModule,
    ExperimentModule,
  ],
})
export class AppModule {}
