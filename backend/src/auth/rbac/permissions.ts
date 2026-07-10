export enum Role {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  SENIOR_LAWYER = 'Senior Lawyer',
  JUNIOR_LAWYER = 'Junior Lawyer',
  INTERN = 'Intern',
}

export enum Permission {
  WORKSPACE = 'Workspace',
  CASE = 'Case',
  DRAFT = 'Draft',
  TEMPLATE = 'Template',
  DOCUMENT = 'Document',
  AI = 'AI',
  EXPORT = 'Export',
  SETTINGS = 'Settings',
  INVITE = 'Invite',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [Role.OWNER]: Object.values(Permission),
  [Role.ADMIN]: Object.values(Permission),
  [Role.SENIOR_LAWYER]: [
    Permission.WORKSPACE,
    Permission.CASE,
    Permission.DRAFT,
    Permission.TEMPLATE,
    Permission.DOCUMENT,
    Permission.AI,
    Permission.EXPORT,
  ],
  [Role.JUNIOR_LAWYER]: [
    Permission.WORKSPACE,
    Permission.CASE,
    Permission.DRAFT,
    Permission.DOCUMENT,
    Permission.AI,
    Permission.EXPORT,
  ],
  [Role.INTERN]: [
    Permission.CASE,
    Permission.DRAFT,
    Permission.DOCUMENT,
    Permission.AI,
  ],
};

export function hasPermission(userRole: string, requiredPermission: Permission): boolean {
  if (!userRole) return false;
  const normalized = userRole.toLowerCase().trim();
  let roleKey = Role.JUNIOR_LAWYER; // Default fallback
  
  if (normalized === 'owner') {
    roleKey = Role.OWNER;
  } else if (normalized === 'admin') {
    roleKey = Role.ADMIN;
  } else if (normalized === 'senior lawyer' || normalized === 'lawyer') {
    roleKey = Role.SENIOR_LAWYER;
  } else if (normalized === 'junior lawyer' || normalized === 'legal-assistant') {
    roleKey = Role.JUNIOR_LAWYER;
  } else if (normalized === 'intern') {
    roleKey = Role.INTERN;
  }
  
  const permissions = ROLE_PERMISSIONS[roleKey] || [];
  return permissions.includes(requiredPermission);
}
