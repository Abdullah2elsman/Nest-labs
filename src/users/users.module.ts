import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import {
  ActiveLogger,
  appConfig,
  APP_CONFIG,
  USERS_STORE,
  USER_LOGGER,
} from './providers/custom-providers';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,

    // ── useValue ─────────────────────────────────────────────────────────────
    // Inject a plain constant object — no instantiation, no class needed.
    // Perfect for configuration objects, connection strings, feature flags, etc.
    {
      provide: APP_CONFIG,
      useValue: appConfig,
    },

    // ── useClass ─────────────────────────────────────────────────────────────
    // Swap the concrete logger implementation based on the environment.
    // NestJS will instantiate the chosen class and inject it wherever
    // USER_LOGGER is requested. Change ActiveLogger to try ProdLogger.
    {
      provide: USER_LOGGER,
      useClass: ActiveLogger,
    },

    // ── useFactory ────────────────────────────────────────────────────────────
    // A factory function creates and returns the value. Useful when the
    // provider needs async setup or depends on other injected services/config.
    // Here it creates the single shared in-memory Map for all users.
    {
      provide: USERS_STORE,
      useFactory: (): Map<number, User> => {
        console.log('[useFactory] Creating in-memory USERS_STORE (Map)');
        return new Map<number, User>();
      },
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
