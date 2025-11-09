import "express-session";
import "passport";
import { AppUser } from "../passport";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface User extends AppUser {}
  }
}

declare module "express-session" {
  interface SessionData {
    passport?: {
      user?: AppUser;
    };
  }
}
