import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto, UpdateCandidateDto } from './candidates.dto';

@ApiTags('candidates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Get()
  findAll() {
    return this.candidatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateCandidateDto) {
    return this.candidatesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCandidateDto) {
    return this.candidatesService.update(Number(id), body);
  }
}
