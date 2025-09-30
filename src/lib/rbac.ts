export const CAN = {
  EMPLOYEE_CREATE: ["OWNER","HR_ADMIN","MANAGER"],
  EMPLOYEE_DELETE: ["OWNER","HR_ADMIN"],
  LEAVE_APPROVE: ["OWNER","HR_ADMIN","MANAGER"],
} as const;

export function can(role: string | undefined, action: keyof typeof CAN) {
  return !!role && CAN[action].includes(role as any);
}
