import { CandidateStatus, Gender } from '../data/data.types';

// note: `identifier` is whatever real-world reference the operator has
// (e.g. a patient number) - it is only used to derive a pseudonym and is
// NEVER stored, per the privacy requirement in the kickoff slides.
export class CreateCandidateDto {
  identifier: string;
  dateOfBirth: string;
  gender: Gender;
  height: number;
  status: CandidateStatus;
}

export class UpdateCandidateDto {
  dateOfBirth?: string;
  gender?: Gender;
  height?: number;
  status?: CandidateStatus;
}
