import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { CadenceService } from './cadence.service';
import { Cadence } from '@apps/shared';

@Controller('cadences')
export class CadenceController {
  constructor(private readonly cadenceService: CadenceService) {}

  @Post()
  create(@Body() cadence: Cadence) {
    return this.cadenceService.create(cadence);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cadenceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() cadence: Cadence) {
    return this.cadenceService.update(id, cadence);
  }

  @Get()
  findAll() {
    return this.cadenceService.findAll();
  }
}
