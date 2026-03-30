export type RoleValue = string | string[] | undefined | null;

export function normalizeRoles(role: RoleValue): string[] {
  if (!role) return [];
  if (Array.isArray(role)) return role;
  return [role];
}

export function hasRole(role: RoleValue, required: string | string[]): boolean {
  const roles = normalizeRoles(role);
  const requiredRoles = Array.isArray(required) ? required : [required];
  return requiredRoles.some((r) => roles.includes(r));
}

export function roleLabel(role: RoleValue): string {
  const roles = normalizeRoles(role);
  return roles.join(", ") || "USER";
}
