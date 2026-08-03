import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentOperator } from '../auth/current-operator.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSessionDto, UpdateSessionDto } from './sessions.dto';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(Number(id));
  }

  @Post()
  create(
    @Body() body: CreateSessionDto,
    @CurrentOperator() operatorId: number,
  ) {
    return this.sessionsService.create(body, operatorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateSessionDto) {
    return this.sessionsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.sessionsService.remove(Number(id));
    return { deleted: true };
  }
}
