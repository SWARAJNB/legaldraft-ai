"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastApiCompatFilter = void 0;
const common_1 = require("@nestjs/common");
let FastApiCompatFilter = class FastApiCompatFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exResponse = exception.getResponse();
            if (typeof exResponse === 'string') {
                message = exResponse;
            }
            else if (typeof exResponse === 'object' && exResponse !== null) {
                const r = exResponse;
                if (Array.isArray(r.message)) {
                    message = r.message.join('. ');
                }
                else {
                    message = r.message || r.error || 'An error occurred';
                }
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        response.status(status).json({
            detail: message,
            message: message,
            statusCode: status,
        });
    }
};
exports.FastApiCompatFilter = FastApiCompatFilter;
exports.FastApiCompatFilter = FastApiCompatFilter = __decorate([
    (0, common_1.Catch)()
], FastApiCompatFilter);
//# sourceMappingURL=fastapi-compat.filter.js.map