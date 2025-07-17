import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { HeroModule } from './hero.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { JwtBlacklistService } from 'src/services/jwt-blacklist.service';
import { ProjectModule } from './project.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    forwardRef(() => HeroModule),
    forwardRef(() => ProjectModule),
  ],
  providers: [AuthService, JwtStrategy, JwtBlacklistService],
  controllers: [AuthController],
  exports: [AuthService, JwtBlacklistService],
})
export class AuthModule {}
