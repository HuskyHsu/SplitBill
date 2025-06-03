import { User } from '../types/user';

export const mockCurrentUser: User = {
  id: 'user123',
  name: '陳大文 (自己)',
  avatarUrl: 'https://ui-avatars.com/api/?name=陳大文&background=00B900&color=fff&size=40',
};

export const mockSharers: User[] = [
  mockCurrentUser,
  {
    id: 'user456',
    name: '林小美',
    avatarUrl: 'https://ui-avatars.com/api/?name=林小美&background=4A90E2&color=fff&size=40',
  },
  {
    id: 'user789',
    name: '張三豐',
    avatarUrl: 'https://ui-avatars.com/api/?name=張三豐&background=D0021B&color=fff&size=40',
  },
];
