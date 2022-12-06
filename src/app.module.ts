import { Module } from '@nestjs/common';
import { CrousModule } from './crous/crous.module';

@Module({
  imports: [CrousModule],
})
export class AppModule {}
