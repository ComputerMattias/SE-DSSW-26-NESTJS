import { NotFoundException } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { DataService } from '../data/data.service';
import { Candidate } from '../data/data.types';

describe('CandidatesService', () => {
  let candidates: Candidate[];
  let mockDataService: DataService;
  let service: CandidatesService;

  beforeEach(() => {
    candidates = [];
    mockDataService = {
      getCandidates: () => candidates,
      setCandidates: (next: Candidate[]) => {
        candidates = next;
      },
    } as unknown as DataService;

    service = new CandidatesService(mockDataService);
  });

  describe('getPseudoName', () => {
    it('is deterministic for the same identifier', () => {
      expect(service.getPseudoName('patient-42')).toBe(
        service.getPseudoName('patient-42'),
      );
    });

    it('differs between different identifiers', () => {
      expect(service.getPseudoName('patient-42')).not.toBe(
        service.getPseudoName('patient-43'),
      );
    });
  });

  describe('create', () => {
    it('never stores the raw identifier, only the pseudonym', () => {
      const candidate = service.create({
        identifier: 'patient-42',
        dateOfBirth: '1958-03-02',
        gender: 'M',
        height: 178,
        status: 'PD',
      });

      expect(candidate.pseudoName).toBe(service.getPseudoName('patient-42'));
      expect(JSON.stringify(candidate)).not.toContain('patient-42');
    });

    it('assigns incrementing ids', () => {
      const first = service.create({
        identifier: 'a',
        dateOfBirth: '1990-01-01',
        gender: 'F',
        height: 165,
        status: 'H',
      });
      const second = service.create({
        identifier: 'b',
        dateOfBirth: '1991-01-01',
        gender: 'M',
        height: 180,
        status: 'H',
      });

      expect(second.id).toBe(first.id + 1);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for an unknown id', () => {
      expect(() => service.findOne(999)).toThrow(NotFoundException);
    });
  });
});
