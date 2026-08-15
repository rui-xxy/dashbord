import { Module } from '@nestjs/common';
import { TargetUserGuard } from '../../common/target-user.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, TargetUserGuard],
  exports: [UserService],
})
export class UserModule {}
