import pino from 'pino';

// Single logger instance used in place of console.log across server code.
// Log level: debug in dev, info in prod. Pretty-print only in dev.
export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:HH:MM:ss' },
    },
  }),
});
