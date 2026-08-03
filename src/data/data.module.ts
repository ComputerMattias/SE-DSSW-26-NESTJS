import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { FileStorageProvider } from './file-storage.provider';
import { STORAGE_PROVIDER } from './storage.interface';

@Module({
  providers: [
    DataService,
    {
      provide: STORAGE_PROVIDER,
      useClass: FileStorageProvider,
    },
  ],
  exports: [DataService],
})
export class DataModule {}
