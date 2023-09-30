import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health-check')
export class HealthController {
  constructor() {}

  @Public()
  @Get()
  async getHealthCheck() {
    return 'ok';
  }
}
