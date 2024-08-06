import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('find-all')
  findAll() {
    return this.usersService.findAll();
  }

  @Get()
  getUser(@Query() queryParams: any) {
    return this.usersService.getUser(queryParams.username);
  }
}
