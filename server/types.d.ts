import 'express-session';

declare module 'express-session' {
  interface SessionData {
    // You can add custom session properties here if needed
  }
}

declare global {
  namespace Express {
    interface Request {
      sessionID: string;
    }
  }
}

export {};
