import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProxyModule } from './proxy/proxy.module';
import { CollectionsModule } from './collections/collections.module';
import { EnvironmentsModule } from './environments/environments.module';
import { HistoryModule } from './history/history.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProxyModule,
    CollectionsModule,
    EnvironmentsModule,
    HistoryModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
