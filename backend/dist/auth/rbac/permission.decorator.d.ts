import { Permission } from './permissions';
export declare const PERMISSION_KEY = "required_permission";
export declare const RequirePermission: (permission: Permission) => import("@nestjs/common").CustomDecorator<string>;
