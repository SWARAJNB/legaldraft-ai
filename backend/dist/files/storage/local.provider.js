"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const fs = require("fs");
const path = require("path");
class LocalStorageProvider {
    constructor(baseDir) {
        this.baseDir = baseDir || process.env.LOCAL_STORAGE_DIR || './data';
        fs.mkdirSync(this.baseDir, { recursive: true });
    }
    getFullPath(key) {
        const cleanKey = key.replace(/\//g, path.sep);
        return path.resolve(this.baseDir, cleanKey);
    }
    async uploadFile(tenantId, category, filename, content) {
        const relativeKey = `tenants/${tenantId}/${category}/${filename}`;
        const fullPath = this.getFullPath(relativeKey);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content);
        return relativeKey;
    }
    async downloadFile(key) {
        const fullPath = this.getFullPath(key);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found in storage: ${key}`);
        }
        return fs.readFileSync(fullPath);
    }
    async deleteFile(key) {
        const fullPath = this.getFullPath(key);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
                let parent = path.dirname(fullPath);
                const base = path.resolve(this.baseDir);
                while (parent !== base) {
                    const children = fs.readdirSync(parent);
                    if (children.length === 0) {
                        fs.rmdirSync(parent);
                        parent = path.dirname(parent);
                    }
                    else {
                        break;
                    }
                }
                return true;
            }
            catch {
                return false;
            }
        }
        return false;
    }
    async getPresignedDownloadUrl(key, expiresIn = 3600) {
        return `/files/download/${key}`;
    }
    async getPresignedUploadUrl(tenantId, category, filename, expiresIn = 3600) {
        const relativeKey = `tenants/${tenantId}/${category}/${filename}`;
        return {
            url: '/files/upload-local-presigned',
            fields: { key: relativeKey, expires_in: expiresIn },
        };
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
//# sourceMappingURL=local.provider.js.map