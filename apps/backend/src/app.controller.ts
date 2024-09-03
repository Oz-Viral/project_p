//app controller
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  //health check
  @Get()
  healthCheck(): string {
    return `I'm healthy`;
  }
}
