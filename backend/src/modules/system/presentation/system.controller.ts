import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '../../../common/dto/api-response.dto';
import { HealthDto } from './dto/health.dto';

@Controller('system')
export class SystemController {

    @Get('health')
    health(): ApiResponse<HealthDto> {
        return ApiResponse.of({ status: 'OK' });
    }
}
