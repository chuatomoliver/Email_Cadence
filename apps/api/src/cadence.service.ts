import { Injectable, NotFoundException } from '@nestjs/common';
import { Cadence } from '@apps/shared';

@Injectable()
export class CadenceService {
  private cadences = new Map<string, Cadence>();

  create(cadence: Cadence) {
    this.cadences.set(cadence.id, cadence);
    return cadence;
  }

  findOne(id: string) {
    const cadence = this.cadences.get(id);
    if (!cadence) throw new NotFoundException(`Cadence ${id} not found`);
    return cadence;
  }

  update(id: string, cadence: Cadence) {
    if (!this.cadences.has(id)) throw new NotFoundException(`Cadence ${id} not found`);
    this.cadences.set(id, cadence);
    return cadence;
  }

  findAll() {
    return Array.from(this.cadences.values());
  }
}
