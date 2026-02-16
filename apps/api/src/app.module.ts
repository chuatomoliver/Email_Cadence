import { Module } from '@nestjs/common';
import { CadenceController } from './cadence.controller';
import { CadenceService } from './cadence.service';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';

@Module({
  imports: [],
  controllers: [CadenceController, EnrollmentController],
  providers: [CadenceService, EnrollmentService],
})
export class AppModule {}
