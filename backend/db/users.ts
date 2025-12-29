import bcrypt from 'bcryptjs';

type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  isPremium: boolean;
  storiesGenerated: number;
  isAdmin: boolean;
  createdAt: string;
  subscriptionEndDate?: string;
  lastLoginAt?: string;
};

const users: User[] = [
  {
    id: "admin",
    email: "admin@socialstoryai.com",
    password: bcrypt.hashSync("admin123", 10),
    name: "Admin",
    isPremium: true,
    storiesGenerated: 0,
    isAdmin: true,
    createdAt: new Date().toISOString(),
  },
];

export function getUserData(emailOrId: string): User | undefined {
  return users.find(u => u.email === emailOrId || u.id === emailOrId);
}

export function createUser(input: {
  email: string;
  password: string;
  name: string;
}): User {
  const hashedPassword = bcrypt.hashSync(input.password, 10);
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: input.email,
    password: hashedPassword,
    name: input.name,
    isPremium: false,
    storiesGenerated: 0,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

export function updateUser(userId: string, updates: Partial<User>): void {
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
  }
}

export function getAllUsers(): User[] {
  return users;
}

export function deleteUser(userId: string): void {
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users.splice(index, 1);
  }
}

export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

export function updatePassword(userId: string, newPassword: string): void {
  const user = getUserData(userId);
  if (user) {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    updateUser(userId, { password: hashedPassword });
  }
}
