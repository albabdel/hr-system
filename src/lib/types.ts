export type Role = 'OWNER' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
}

export interface Department {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  imageHint: string;
  position: Position;
  department: Department;
  role: Role;
  status: 'Active' | 'Inactive' | 'On Leave';
}
