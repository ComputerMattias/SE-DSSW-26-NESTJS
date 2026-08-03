import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import { DataService } from '../data/data.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dataService: DataService,
  ) {}

  login(username: string, password: string): { access_token: string } {
    const operator = this.dataService
      .getOperators()
      .find((o) => o.username === username);

    const passwordHash = createHash('sha256').update(password).digest('hex');

    if (!operator || operator.passwordHash !== passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: operator.id, username: operator.username };

    return { access_token: this.jwtService.sign(payload) };
  }
}
