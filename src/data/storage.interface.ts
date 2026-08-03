import { DataStore } from './data.types';

// Any storage backend (file, database, remote API...) just has to implement
// this. Nothing outside the data module needs to know HOW it's stored.
export interface StorageProvider {
  loadData(): DataStore;
  saveData(data: DataStore): void;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
