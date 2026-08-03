import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExperimentService } from './experiment.service';

// Every route here has an identical shape/path to David's Experiment API -
// see /mnt/user-data/.../experiment-api for the source of truth. We just
// add the JwtAuthGuard in front and forward everything else untouched.
@ApiTags('experiment-proxy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ExperimentController {
  constructor(private experimentService: ExperimentService) {}

  private async relay(
    res: Response,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    options: { params?: Record<string, unknown>; data?: unknown } = {},
  ) {
    const result = await this.experimentService.forward(method, path, options);
    res.status(result.status).json(result.data);
  }

  // --- experiments ---
  @Post('experiments')
  createExperiment(@Body() body: unknown, @Res() res: Response) {
    return this.relay(res, 'POST', '/experiments', { data: body });
  }

  @Get('experiments')
  listExperiments(@Query() query: Record<string, unknown>, @Res() res: Response) {
    return this.relay(res, 'GET', '/experiments', { params: query });
  }

  @Get('experiments/:experimentId')
  getExperiment(
    @Param('experimentId') experimentId: string,
    @Res() res: Response,
  ) {
    return this.relay(res, 'GET', `/experiments/${experimentId}`);
  }

  @Patch('experiments/:experimentId')
  updateExperiment(
    @Param('experimentId') experimentId: string,
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    return this.relay(res, 'PATCH', `/experiments/${experimentId}`, {
      data: body,
    });
  }

  @Delete('experiments/:experimentId')
  deleteExperiment(
    @Param('experimentId') experimentId: string,
    @Res() res: Response,
  ) {
    return this.relay(res, 'DELETE', `/experiments/${experimentId}`);
  }

  // --- exercises ---
  @Post('experiments/:experimentId/exercises')
  createExercise(
    @Param('experimentId') experimentId: string,
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    return this.relay(
      res,
      'POST',
      `/experiments/${experimentId}/exercises`,
      { data: body },
    );
  }

  @Get('experiments/:experimentId/exercises')
  listExercisesForExperiment(
    @Param('experimentId') experimentId: string,
    @Res() res: Response,
  ) {
    return this.relay(res, 'GET', `/experiments/${experimentId}/exercises`);
  }

  @Get('exercises')
  listExercises(@Query() query: Record<string, unknown>, @Res() res: Response) {
    return this.relay(res, 'GET', '/exercises', { params: query });
  }

  @Get('exercises/:exerciseId')
  getExercise(@Param('exerciseId') exerciseId: string, @Res() res: Response) {
    return this.relay(res, 'GET', `/exercises/${exerciseId}`);
  }

  @Delete('exercises/:exerciseId')
  deleteExercise(
    @Param('exerciseId') exerciseId: string,
    @Res() res: Response,
  ) {
    return this.relay(res, 'DELETE', `/exercises/${exerciseId}`);
  }

  // --- recording control ---
  @Post('exercises/:exerciseId/recording/start')
  startRecording(
    @Param('exerciseId') exerciseId: string,
    @Res() res: Response,
  ) {
    return this.relay(
      res,
      'POST',
      `/exercises/${exerciseId}/recording/start`,
    );
  }

  @Post('exercises/:exerciseId/recording/stop')
  stopRecording(
    @Param('exerciseId') exerciseId: string,
    @Res() res: Response,
  ) {
    return this.relay(res, 'POST', `/exercises/${exerciseId}/recording/stop`);
  }

  // --- data ---
  @Get('exercises/:exerciseId/data')
  getExerciseData(
    @Param('exerciseId') exerciseId: string,
    @Res() res: Response,
  ) {
    return this.relay(res, 'GET', `/exercises/${exerciseId}/data`);
  }

  @Delete('exercises/:exerciseId/data')
  clearExerciseData(
    @Param('exerciseId') exerciseId: string,
    @Res() res: Response,
  ) {
    return this.relay(res, 'DELETE', `/exercises/${exerciseId}/data`);
  }
}
