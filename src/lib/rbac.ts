export const CAN = {
  EMPLOYEE_CREATE: ["OWNER","HR_ADMIN","MANAGER"],
  EMPLOYEE_DELETE: ["OWNER","HR_ADMIN"],
};
export function can(role: string, action: keyof typeof CAN) {
  return CAN[action].includes(role as any);
}
