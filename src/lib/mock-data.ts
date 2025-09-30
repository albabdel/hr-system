import type { Employee, Department, Position } from '@/lib/types';

// This data is now for populating form dropdowns and for fallback.
// The main employee list is fetched from the API.

export const departments: Department[] = [
  { id: 'd1', name: 'Engineering' },
  { id: 'd2', name: 'Design' },
  { id: 'd3', name: 'Marketing' },
  { id: 'd4', name: 'Sales' },
  { id: 'd5', name: 'Human Resources' },
];

export const positions: Position[] = [
  { id: 'p1', name: 'Software Engineer' },
  { id: 'p2', name: 'UX/UI Designer' },
  { id: 'p3', name: 'Product Manager' },
  { id: 'p4', name: 'Marketing Specialist' },
  { id: 'p5', name: 'Sales Representative' },
  { id: 'p6', name: 'HR Manager' },
  { id: 'p7', name: 'Frontend Developer' },
  { id: 'p8', name: 'Backend Developer' },
];
