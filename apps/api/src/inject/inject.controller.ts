import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { InjectService } from './inject.service';
import { BuildInjectionDto } from './dto/build-injection.dto';
import { ClerkGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Inject')
@ApiBearerAuth()
@Controller('inject')
@UseGuards(ClerkGuard)
export class InjectController {
  private readonly logger = new Logger(InjectController.name);

  constructor(private readonly injectService: InjectService) {}

  @Post('build')
  async build(@CurrentUser() user: any, @Body() buildInjectionDto: BuildInjectionDto) {
    const userId = user.id;
    this.logger.log(`Building context for user ${userId}, platform: ${buildInjectionDto.platform}`);
    return this.injectService.buildContext(userId, buildInjectionDto);
  }
}
