import type { Role } from "../constants/Role";

export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
