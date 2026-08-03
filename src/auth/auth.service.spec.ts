import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import { AuthService } from './auth.service';
import { DataService } from '../data/data.service';

describe('AuthService', () => {
  const passwordHash = createHash('sha256').update('operator123').digest('hex');

  const mockDataService = {
    getOperators: () => [
      { id: 1, username: 'operator', passwordHash },
    ],
  } as unknown as DataService;

  const service = new AuthService(
    new JwtService({ secret: 'test_secret' }),
    mockDataService,
  );

  it('should return an access token for valid credentials', () => {
    const result = service.login('operator', 'operator123');

    expect(result.access_token).toBeDefined();
    expect(typeof result.access_token).toBe('string');
  });

  it('should throw UnauthorizedException for a wrong password', () => {
    expect(() => service.login('operator', 'wrong')).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for an unknown username', () => {
    expect(() => service.login('nobody', 'operator123')).toThrow(
      UnauthorizedException,
    );
  });
});
