// Data shapes taken from the "Implementation" diagram in the kickoff slides.

export type Gender = 'F' | 'M' | 'D';
export type CandidateStatus = 'H' | 'PD'; // Healthy | Parkinson's Disease
export type Condition = 'small' | 'middle' | 'big';

export interface Candidate {
  id: number;
  pseudoName: string; // pseudonymized identifier, never the real name
  dateOfBirth: string; // ISO date string
  gender: Gender;
  height: number; // cm
  status: CandidateStatus;
}

export interface Step {
  id: number;
  stepLengthMm: number;
  startTime: number; // unix ms
  endTime: number; // unix ms
}

export interface LipAperture {
  id: number;
  mouthOpeningMm: number;
  timestamp: number;
}

export interface SpeakingVolume {
  id: number;
  volumeDb: number;
  timestamp: number;
}

export interface Measurement {
  id: number;
  sessionId: number;
  condition: Condition;
  startTime: number | null;
  endTime: number | null;
  status: 'pending' | 'in-progress' | 'completed' | 'aborted';
  steps: Step[];
  lipApertures: LipAperture[];
  speakingVolumes: SpeakingVolume[];
}

export interface Operator {
  id: number;
  username: string;
  passwordHash: string;
}

export interface Session {
  id: number;
  candidateId: number;
  operatorId: number;
  status: 'in-progress' | 'completed' | 'aborted';
  createdAt: number;
  measurements: Measurement[];
}

// everything the file-based store persists
export interface DataStore {
  candidates: Candidate[];
  sessions: Session[];
  operators: Operator[];
}
