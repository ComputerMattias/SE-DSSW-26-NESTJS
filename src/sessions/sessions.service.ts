import { Injectable, NotFoundException } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { Measurement, Session } from '../data/data.types';
import { CreateSessionDto, UpdateSessionDto } from './sessions.dto';

@Injectable()
export class SessionsService {
  constructor(private dataService: DataService) {}

  findAll(): Session[] {
    return this.dataService.getSessions();
  }

  findOne(id: number): Session {
    const session = this.dataService.getSessions().find((s) => s.id === id);
    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }
    return session;
  }

  create(dto: CreateSessionDto, operatorId: number): Session {
    const sessions = this.dataService.getSessions();
    const sessionId = sessions.length
      ? Math.max(...sessions.map((s) => s.id)) + 1
      : 1;

    // one pending measurement per requested condition, so the operator has
    // a clear, ordered list of what still needs to be tested.
    const measurements: Measurement[] = dto.conditions.map((condition, i) => ({
      id: i + 1,
      sessionId,
      condition,
      startTime: null,
      endTime: null,
      status: 'pending',
      steps: [],
      lipApertures: [],
      speakingVolumes: [],
    }));

    const session: Session = {
      id: sessionId,
      candidateId: dto.candidateId,
      operatorId,
      status: 'in-progress',
      createdAt: Date.now(),
      measurements,
    };

    this.dataService.setSessions([...sessions, session]);
    return session;
  }

  update(id: number, dto: UpdateSessionDto): Session {
    const sessions = this.dataService.getSessions();
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Session ${id} not found`);
    }

    const updated = { ...sessions[index], ...dto };
    const next = [...sessions];
    next[index] = updated;
    this.dataService.setSessions(next);
    return updated;
  }

  remove(id: number): void {
    const sessions = this.dataService.getSessions();
    const exists = sessions.some((s) => s.id === id);
    if (!exists) {
      throw new NotFoundException(`Session ${id} not found`);
    }
    this.dataService.setSessions(sessions.filter((s) => s.id !== id));
  }

  // helper used by the measurements module so it doesn't need direct
  // filesystem/dataService access - keeps session mutation in one place.
  saveMeasurement(sessionId: number, measurement: Measurement): Measurement {
    const session = this.findOne(sessionId);
    const measurements = session.measurements.map((m) =>
      m.id === measurement.id ? measurement : m,
    );
    const sessions = this.dataService.getSessions();
    const updatedSessions = sessions.map((s) =>
      s.id === sessionId ? { ...s, measurements } : s,
    );
    this.dataService.setSessions(updatedSessions);
    return measurement;
  }

  removeMeasurement(sessionId: number, measurementId: number): void {
    const session = this.findOne(sessionId);
    const measurements = session.measurements.filter(
      (m) => m.id !== measurementId,
    );
    const sessions = this.dataService.getSessions();
    const updatedSessions = sessions.map((s) =>
      s.id === sessionId ? { ...s, measurements } : s,
    );
    this.dataService.setSessions(updatedSessions);
  }
}
