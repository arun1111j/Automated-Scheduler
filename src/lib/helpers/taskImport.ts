// src/lib/helpers/taskImport.ts
import { taskSchema } from '@/lib/validations';

export async function importTaskData(taskData: any, userId: string) {
    // Attach userId
    taskData.userId = userId;
    const validated = taskSchema.safeParse(taskData);
    if (!validated.success) {
        console.error('Row validation failed:', JSON.stringify(validated.error.errors, null, 2));
        console.error('Invalid Data:', JSON.stringify(taskData, null, 2));
        return null;
    }
    // Remove undefined fields to satisfy Prisma type expectations
    const cleanData: any = { ...validated.data, userId };
    Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === undefined) delete cleanData[key];
    });
    return cleanData;
}
