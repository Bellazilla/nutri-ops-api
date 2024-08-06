import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewInvitation } from './review-invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewInvitation])],
  exports: [TypeOrmModule],
})
export class ReviewInvitationModule {}
