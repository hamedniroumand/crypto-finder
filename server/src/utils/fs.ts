import { writeFileSync } from 'fs'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const writeFile = (path: string, data: string) => {
    writeFileSync(path, data);
}

export const getDirname = (importMetaUrl: string) => {
    return dirname(fileURLToPath(importMetaUrl));
}