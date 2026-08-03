import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DataService } from '../data/data.service';
import { Candidate } from '../data/data.types';
import { CreateCandidateDto, UpdateCandidateDto } from './candidates.dto';

@Injectable()
export class CandidatesService {
  constructor(private dataService: DataService) {}

  // turns a real-world identifier into a stable, non-reversible pseudonym.
  // same identifier always maps to the same pseudonym, but you can't go
  // backwards from the pseudonym to the identifier.
  getPseudoName(identifier: string): string {
    const digest = createHash('sha256').update(identifier).digest('hex');
    return `P-${digest.slice(0, 8)}`;
  }

  findAll(): Candidate[] {
    return this.dataService.getCandidates();
  }

  findOne(id: number): Candidate {
    const candidate = this.dataService.getCandidates().find((c) => c.id === id);
    if (!candidate) {
      throw new NotFoundException(`Candidate ${id} not found`);
    }
    return candidate;
  }

  create(dto: CreateCandidateDto): Candidate {
    const candidates = this.dataService.getCandidates();
    const candidate: Candidate = {
      id: candidates.length ? Math.max(...candidates.map((c) => c.id)) + 1 : 1,
      pseudoName: this.getPseudoName(dto.identifier),
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      height: dto.height,
      status: dto.status,
    };

    this.dataService.setCandidates([...candidates, candidate]);
    return candidate;
  }

  update(id: number, dto: UpdateCandidateDto): Candidate {
    const candidates = this.dataService.getCandidates();
    const index = candidates.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Candidate ${id} not found`);
    }

    const updated = { ...candidates[index], ...dto };
    const next = [...candidates];
    next[index] = updated;
    this.dataService.setCandidates(next);
    return updated;
  }
}
