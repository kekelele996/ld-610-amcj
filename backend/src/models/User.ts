import type { Role } from "../constants/Role";

export interface User {
  id: number;
  username: string;
  display_name: string;
  role: Role;
}
