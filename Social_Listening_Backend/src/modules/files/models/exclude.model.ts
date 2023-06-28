import { File } from '@prisma/client';

export const excludeFile: (keyof File)[] = ['minetype', 'path', 'groupId'];
