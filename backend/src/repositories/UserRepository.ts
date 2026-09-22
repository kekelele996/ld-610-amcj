import { db, clone } from "./db";

export const userRepository = {
  findAll: () => clone(db.user),
  findByUsername: (username: string) => {
    const row = db.user.find((item) => item.username === username);
    return row ? clone(row) : null;
  },
  findById: (id: number) => {
    const row = db.user.find((item) => item.id === id);
    return row ? clone(row) : null;
  }
};
