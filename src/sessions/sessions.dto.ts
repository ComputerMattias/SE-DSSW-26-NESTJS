import { Condition } from '../data/data.types';

export class CreateSessionDto {
  candidateId: number;
  // which conditions to schedule for this session, in the order they
  // should be tested (e.g. ['small', 'middle', 'big'])
  conditions: Condition[];
}

export class UpdateSessionDto {
  status?: 'in-progress' | 'completed' | 'aborted';
}
