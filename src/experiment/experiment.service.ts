import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

// Generic proxy to David's Experiment API. Every method here just forwards
// the request as-is and returns whatever David's server responds with, so
// the CPA frontend (already built against his routes) keeps working
// unchanged - it just needs to point at THIS server instead, so requests go
// through our operator auth first.
@Injectable()
export class ExperimentService {
  private readonly baseUrl: string;

  constructor(private http: HttpService) {
    this.baseUrl =
      process.env.EXPERIMENT_API_BASE_URL ?? 'http://localhost:3001';
  }

  async forward(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    options: { params?: Record<string, unknown>; data?: unknown } = {},
  ): Promise<{ status: number; data: unknown }> {
    try {
      const response = await firstValueFrom(
        this.http.request({
          method,
          url: `${this.baseUrl}${path}`,
          params: options.params,
          data: options.data,
          // David's API doesn't require auth of its own today; if that
          // changes, add the header here (e.g. from EXPERIMENT_API_KEY) -
          // this is the only place it would need to be added.
        }),
      );
      return { status: response.status, data: response.data as unknown };
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response) {
        // pass David's error status/body straight through
        return {
          status: axiosErr.response.status,
          data: axiosErr.response.data,
        };
      }
      throw new InternalServerErrorException(
        'Could not reach the Experiment API',
      );
    }
  }
}
