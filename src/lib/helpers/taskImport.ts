// src/lib/helpers/taskImport.ts
import { taskSchema } from '@/lib/validations';

export async function importTaskData(taskData: any, userId: string) {
    // Attach userId
    taskData.userId = userId;
    const validated = taskSchema.safeParse(taskData);
    if (!validated.success) {
        console.warn('Row validation failed', validated.error.errors);
        return null;
    }
    // Remove undefined fields to satisfy Prisma type expectations
    const cleanData: any = { ...validated.data };
    Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === undefined) delete cleanData[key];
    });
    return cleanData;
}
