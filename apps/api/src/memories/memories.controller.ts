import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { BulkApproveDto } from './dto/bulk-approve.dto';
import { ClerkGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Memories')
@ApiBearerAuth()
@UseGuards(ClerkGuard)
@Controller('memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create memory manually' })
  create(@CurrentUser() user: any, @Body() createMemoryDto: CreateMemoryDto) {
    return this.memoriesService.create(user.id, createMemoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all memories' })
  findAll(@CurrentUser() user: any) {
    return this.memoriesService.findAll(user.id);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get pending approval queue' })
  findSuggestions(@CurrentUser() user: any) {
    return this.memoriesService.findSuggestions(user.id);
  }

  @Post('bulk-approve')
  @ApiOperation({ summary: 'Approve multiple suggestions' })
  bulkApprove(
    @CurrentUser() user: any,
    @Body() bulkApproveDto: BulkApproveDto,
  ) {
    return this.memoriesService.bulkApprove(user.id, bulkApproveDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single memory' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.memoriesService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update memory' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateMemoryDto: UpdateMemoryDto,
  ) {
    return this.memoriesService.update(user.id, id, updateMemoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete memory' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.memoriesService.remove(user.id, id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve suggested memory' })
  approve(@CurrentUser() user: any, @Param('id') id: string) {
    return this.memoriesService.approve(user.id, id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject suggested memory' })
  reject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.memoriesService.reject(user.id, id);
  }
}
