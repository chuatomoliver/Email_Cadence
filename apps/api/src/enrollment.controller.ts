import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CadenceStep } from '@apps/shared';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  enroll(@Body() body: { cadenceId: string; contactEmail: string }) {
    return this.enrollmentService.enroll(body.cadenceId, body.contactEmail);
  }

  @Get(':id')
  getStatus(@Param('id') id: string) {
    return this.enrollmentService.getStatus(id);
  }

  @Post(':id/update-cadence')
  updateCadence(@Param('id') id: string, @Body() body: { steps: CadenceStep[] }) {
    return this.enrollmentService.updateCadence(id, body.steps);
  }
}
