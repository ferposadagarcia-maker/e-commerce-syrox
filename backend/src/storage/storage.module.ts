import { Module } from '@nestjs/common';
import { SupabaseStorageService } from './supabase-storage.service.js';

@Module({
  providers: [SupabaseStorageService],
  exports: [SupabaseStorageService],
})
export class StorageModule {}
