import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Mock JwtService
class JwtServiceMock {
  verifyAsync(token: string): Promise<any> {
    if (token === 'validToken') {
      return Promise.resolve({
        /* mocked payload */
      });
    } else {
      throw new Error('Invalid token');
    }
  }
}

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard, { provide: JwtService, useClass: JwtServiceMock }],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token provided', async () => {
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    } as any;
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer invalidToken' },
        }),
      }),
    } as any;
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
