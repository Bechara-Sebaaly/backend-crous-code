import { Module } from '@nestjs/common';
import { CrousService } from './crous.service';
import { CrousController } from './crous.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [CrousController],
  providers: [CrousService],
  exports: [CrousModule],
})
export class CrousModule {}
