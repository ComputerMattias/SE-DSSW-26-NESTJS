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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateMeasurementDto,
  UpdateMeasurementDto,
} from './measurements.dto';
import { MeasurementsService } from './measurements.service';

@ApiTags('measurements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions/:sessionId/measurements')
export class MeasurementsController {
  constructor(private measurementsService: MeasurementsService) {}

  @Get()
  findAll(@Param('sessionId') sessionId: string) {
    return this.measurementsService.findAll(Number(sessionId));
  }

  @Get(':measurementId')
  findOne(
    @Param('sessionId') sessionId: string,
    @Param('measurementId') measurementId: string,
  ) {
    return this.measurementsService.findOne(
      Number(sessionId),
      Number(measurementId),
    );
  }

  @Post()
  create(
    @Param('sessionId') sessionId: string,
    @Body() body: CreateMeasurementDto,
  ) {
    return this.measurementsService.create(Number(sessionId), body);
  }

  @Patch(':measurementId')
  update(
    @Param('sessionId') sessionId: string,
    @Param('measurementId') measurementId: string,
    @Body() body: UpdateMeasurementDto,
  ) {
    return this.measurementsService.update(
      Number(sessionId),
      Number(measurementId),
      body,
    );
  }

  @Delete(':measurementId')
  remove(
    @Param('sessionId') sessionId: string,
    @Param('measurementId') measurementId: string,
  ) {
    this.measurementsService.remove(Number(sessionId), Number(measurementId));
    return { deleted: true };
  }
}
