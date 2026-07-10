"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.Permission = exports.Role = void 0;
exports.hasPermission = hasPermission;
var Role;
(function (Role) {
    Role["OWNER"] = "Owner";
    Role["ADMIN"] = "Admin";
    Role["SENIOR_LAWYER"] = "Senior Lawyer";
    Role["JUNIOR_LAWYER"] = "Junior Lawyer";
    Role["INTERN"] = "Intern";
})(Role || (exports.Role = Role = {}));
var Permission;
(function (Permission) {
    Permission["WORKSPACE"] = "Workspace";
    Permission["CASE"] = "Case";
    Permission["DRAFT"] = "Draft";
    Permission["TEMPLATE"] = "Template";
    Permission["DOCUMENT"] = "Document";
    Permission["AI"] = "AI";
    Permission["EXPORT"] = "Export";
    Permission["SETTINGS"] = "Settings";
    Permission["INVITE"] = "Invite";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_PERMISSIONS = {
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
function hasPermission(userRole, requiredPermission) {
    if (!userRole)
        return false;
    const normalized = userRole.toLowerCase().trim();
    let roleKey = Role.JUNIOR_LAWYER;
    if (normalized === 'owner') {
        roleKey = Role.OWNER;
    }
    else if (normalized === 'admin') {
        roleKey = Role.ADMIN;
    }
    else if (normalized === 'senior lawyer' || normalized === 'lawyer') {
        roleKey = Role.SENIOR_LAWYER;
    }
    else if (normalized === 'junior lawyer' || normalized === 'legal-assistant') {
        roleKey = Role.JUNIOR_LAWYER;
    }
    else if (normalized === 'intern') {
        roleKey = Role.INTERN;
    }
    const permissions = exports.ROLE_PERMISSIONS[roleKey] || [];
    return permissions.includes(requiredPermission);
}
//# sourceMappingURL=permissions.js.map