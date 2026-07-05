"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const roles_guard_1 = require("../guards/roles.guard");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
const Roles = (...roles) => (0, common_1.SetMetadata)(roles_guard_1.ROLES_KEY, roles);
exports.Roles = Roles;
//# sourceMappingURL=auth.decorators.js.map