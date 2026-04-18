export type RoleValue = string | string[] | undefined | null;

export function normalizeRoles(role: RoleValue): string[] {
  if (!role) return [];
  if (Array.isArray(role)) return role.filter(Boolean);
  return [role];
}

export function hasRole(role: RoleValue, required: string | string[]): boolean {
  const roles = normalizeRoles(role);
  if (roles.length === 0) return false;
  const requiredRoles = Array.isArray(required) ? required : [required];
  return requiredRoles.some((r) => roles.includes(r));
}

export function roleLabel(role: RoleValue): string {
  const roles = normalizeRoles(role);
  return roles.join(", ") || "USER";
}

// ✅ Add this — single source of truth for role-based redirects
// Used by both middleware.ts and LoginForm.tsx
export function getRoleHome(role: RoleValue): string {
  const roles = normalizeRoles(role);
  if (roles.includes("ADMIN")) return "/admin";
  if (roles.includes("COUNSELOR")) return "/counselor/dashboard";
  if (roles.includes("VOLUNTEER")) return "/volunteer/dashboard";
  if (roles.includes("TEACHER")) return "/teacher/dashboard";
  return "/dashboard";
}
