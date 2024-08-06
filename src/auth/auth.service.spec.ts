import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt'; // Import the JwtService
import { UsersService } from 'users/users.service';
import { Repository } from 'typeorm';
import { User } from 'users/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'testpass',
    name: 'test name',
    lastname: 'test lastname',
    email: 'testemail',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService, // Add UsersService as a provider
        JwtService, // Add JwtService as a provider
        {
          provide: getRepositoryToken(User),
          useClass: Repository, // Mock the TypeORM Repository class
        },
      ],
      imports: [],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService); // Add this line to get the UsersService instance
    jwtService = module.get<JwtService>(JwtService); // Add this line to get the JwtService instance
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should return an access token on successful sign-in', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mockAccessToken');
    // Act
    const result = await authService.signIn('testuser', 'testpass');
    // Assert
    expect(result.access_token).toBe('mockAccessToken');
    // You can add more assertions based on your specific use case
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
    // Act & Assert
    await expect(
      authService.signIn('nonexistentuser', 'password'),
    ).rejects.toThrowError(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

    // Act & Assert
    await expect(
      authService.signIn('testuser', 'wrongpassword'),
    ).rejects.toThrowError(UnauthorizedException);
  });
});
