export declare enum Role {
    OWNER = "Owner",
    ADMIN = "Admin",
    SENIOR_LAWYER = "Senior Lawyer",
    JUNIOR_LAWYER = "Junior Lawyer",
    INTERN = "Intern"
}
export declare enum Permission {
    WORKSPACE = "Workspace",
    CASE = "Case",
    DRAFT = "Draft",
    TEMPLATE = "Template",
    DOCUMENT = "Document",
    AI = "AI",
    EXPORT = "Export",
    SETTINGS = "Settings",
    INVITE = "Invite"
}
export declare const ROLE_PERMISSIONS: Record<string, Permission[]>;
export declare function hasPermission(userRole: string, requiredPermission: Permission): boolean;
