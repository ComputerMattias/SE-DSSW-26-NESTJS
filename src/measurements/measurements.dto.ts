import { Condition } from '../data/data.types';

export class CreateMeasurementDto {
  condition: Condition;
}

// covers starting/aborting/completing a measurement and appending the
// recorded samples (steps, lip apertures, speaking volumes) as they come in
export class UpdateMeasurementDto {
  status?: 'pending' | 'in-progress' | 'completed' | 'aborted';
  startTime?: number;
  endTime?: number;
  appendStep?: { stepLengthMm: number; startTime: number; endTime: number };
  appendLipAperture?: { mouthOpeningMm: number; timestamp: number };
  appendSpeakingVolume?: { volumeDb: number; timestamp: number };
}
