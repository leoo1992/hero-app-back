import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth.module';
import { HeroModule } from './modules/hero.module';
import { ProjectModule } from './modules/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hero } from './entities/hero.entity';
import { Project } from './entities/project.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
      {
        
        console.log('DB_HOST:', configService.get('DB_HOST'));
        console.log('DB_USERNAME:', configService.get('DB_USERNAME'));
        console.log('DB_PASSWORD:', configService.get('DB_PASSWORD'));
        console.log('DB_NAME:', configService.get('DB_NAME'));

        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: parseInt(configService.get('DB_PORT') || '5432'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
