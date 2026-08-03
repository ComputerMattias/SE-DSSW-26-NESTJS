import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { DataStore } from './data.types';
import { StorageProvider } from './storage.interface';

function hash(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// there's no backend yet, so we just keep everything in a JSON file.
// this is intentionally the ONLY place in the app that touches the filesystem
// directly - swapping this for a real database later means writing one new
// class that implements StorageProvider, nothing else changes.
@Injectable()
export class FileStorageProvider implements StorageProvider {
  private readonly filePath: string;

  constructor() {
    this.filePath = process.env.DATA_FILE_PATH ?? './data/store.json';
  }

  loadData(): DataStore {
    if (!existsSync(this.filePath)) {
      const seed = this.getSeedData();
      this.saveData(seed);
      return seed;
    }

    const raw = readFileSync(this.filePath, 'utf-8');
    return JSON.parse(raw) as DataStore;
  }

  saveData(data: DataStore): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  // default operator account so the frontend/README has something to log in
  // with on a fresh checkout. Credentials also documented in the README.
  private getSeedData(): DataStore {
    return {
      candidates: [],
      sessions: [],
      operators: [
        {
          id: 1,
          username: 'operator',
          passwordHash: hash('operator123'),
        },
      ],
    };
  }
}
