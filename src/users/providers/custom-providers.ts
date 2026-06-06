// ─────────────────────────────────────────────────────────────────────────────
// Custom Provider tokens
// ─────────────────────────────────────────────────────────────────────────────
export const USERS_STORE = 'USERS_STORE';     // useFactory
export const USER_LOGGER = 'USER_LOGGER';     // useClass
export const APP_CONFIG  = 'APP_CONFIG';      // useValue

// ─────────────────────────────────────────────────────────────────────────────
// useValue — static application config object
// ─────────────────────────────────────────────────────────────────────────────
export const appConfig = {
  appName: 'NestJS Learning Project',
  version: '1.0.0',
  environment: process.env.NODE_ENV ?? 'development',
};

// ─────────────────────────────────────────────────────────────────────────────
// useClass — Logger interface + two implementations
// ─────────────────────────────────────────────────────────────────────────────
export abstract class AbstractLogger {
  abstract log(message: string): void;
}

export class DevLogger extends AbstractLogger {
  log(message: string): void {
    console.log(`[DEV] 🛠  ${new Date().toISOString()} — ${message}`);
  }
}

export class ProdLogger extends AbstractLogger {
  log(message: string): void {
    // In production you would send to a log aggregator
    console.log(`[PROD] 🚀 ${new Date().toISOString()} — ${message}`);
  }
}

// The active logger class is chosen based on NODE_ENV (useClass swap example)
export const ActiveLogger =
  process.env.NODE_ENV === 'production' ? ProdLogger : DevLogger;
