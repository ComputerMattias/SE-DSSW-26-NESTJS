import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { Measurement } from '../data/data.types';
import { CreateMeasurementDto, UpdateMeasurementDto } from './measurements.dto';

@Injectable()
export class MeasurementsService {
  constructor(private sessionsService: SessionsService) {}

  findAll(sessionId: number): Measurement[] {
    return this.sessionsService.findOne(sessionId).measurements;
  }

  findOne(sessionId: number, measurementId: number): Measurement {
    const measurement = this.findAll(sessionId).find(
      (m) => m.id === measurementId,
    );
    if (!measurement) {
      throw new NotFoundException(
        `Measurement ${measurementId} not found in session ${sessionId}`,
      );
    }
    return measurement;
  }

  create(sessionId: number, dto: CreateMeasurementDto): Measurement {
    const existing = this.findAll(sessionId);
    const measurement: Measurement = {
      id: existing.length ? Math.max(...existing.map((m) => m.id)) + 1 : 1,
      sessionId,
      condition: dto.condition,
      startTime: null,
      endTime: null,
      status: 'pending',
      steps: [],
      lipApertures: [],
      speakingVolumes: [],
    };
    return this.sessionsService.saveMeasurement(sessionId, measurement);
  }

  update(
    sessionId: number,
    measurementId: number,
    dto: UpdateMeasurementDto,
  ): Measurement {
    const measurement = this.findOne(sessionId, measurementId);

    if (dto.appendStep) {
      measurement.steps.push({
        id: measurement.steps.length + 1,
        ...dto.appendStep,
      });
    }
    if (dto.appendLipAperture) {
      measurement.lipApertures.push({
        id: measurement.lipApertures.length + 1,
        ...dto.appendLipAperture,
      });
    }
    if (dto.appendSpeakingVolume) {
      measurement.speakingVolumes.push({
        id: measurement.speakingVolumes.length + 1,
        ...dto.appendSpeakingVolume,
      });
    }
    if (dto.status) measurement.status = dto.status;
    if (dto.startTime !== undefined) measurement.startTime = dto.startTime;
    if (dto.endTime !== undefined) measurement.endTime = dto.endTime;

    return this.sessionsService.saveMeasurement(sessionId, measurement);
  }

  remove(sessionId: number, measurementId: number): void {
    // findOne throws NotFoundException if either id doesn't exist
    this.findOne(sessionId, measurementId);
    this.sessionsService.removeMeasurement(sessionId, measurementId);
  }
}
