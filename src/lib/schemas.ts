import { z } from "zod";

export const EmployeeCreate = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.coerce.date().optional(),
  managerId: z.string().optional(),
});

export const LeaveTypeCreate = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(2),
  allowanceDays: z.number().int().min(0).default(14),
  requiresApproval: z.boolean().default(true),
});

export const LeaveRequestCreate = z.object({
  employeeId: z.string().min(1),
  typeCode: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().max(500).optional(),
}).refine(v => v.endDate >= v.startDate, { message: "End date must be after start date", path: ["endDate"] });

export const TimeClockAction = z.object({
  employeeId: z.string().min(1),
  action: z.enum(["IN","OUT"]),
  notes: z.string().max(300).optional(),
});

export const EmployeeBulk = z.array(z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(), // ISO date
  managerEmail: z.string().email().optional(),
})).min(1).max(5000);
