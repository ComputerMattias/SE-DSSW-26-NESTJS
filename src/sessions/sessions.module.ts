import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DataModule } from '../data/data.module';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
