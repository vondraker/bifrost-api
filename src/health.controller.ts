import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
    @Get()
    health(): { status: string; timestamp: Date } {
        return { status: 'ok', timestamp: new Date() };
    }
}
