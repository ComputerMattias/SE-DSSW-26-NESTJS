import { Inject, Injectable } from '@nestjs/common';
import { Candidate, DataStore, Operator, Session } from './data.types';
import { STORAGE_PROVIDER, StorageProvider } from './storage.interface';

@Injectable()
export class DataService {
  private store: DataStore;

  constructor(@Inject(STORAGE_PROVIDER) private storage: StorageProvider) {
    this.store = this.storage.loadData();
  }

  private persist(): void {
    this.storage.saveData(this.store);
  }

  // --- candidates ---
  getCandidates(): Candidate[] {
    return this.store.candidates;
  }

  setCandidates(candidates: Candidate[]): void {
    this.store.candidates = candidates;
    this.persist();
  }

  // --- sessions ---
  getSessions(): Session[] {
    return this.store.sessions;
  }

  setSessions(sessions: Session[]): void {
    this.store.sessions = sessions;
    this.persist();
  }

  // --- operators ---
  getOperators(): Operator[] {
    return this.store.operators;
  }
}
