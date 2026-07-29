import { IRequestContext } from '@server/Application';
import { z } from 'zod';

export const CreateSegmentTypeInputSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
});

export const UpdateSegmentTypeInputSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1, 'El nombre es requerido'),
});

export const DeleteSegmentTypeInputSchema = z.object({
  id: z.number().int().positive(),
});

export const GetUserSegmentsInputSchema = z.object({
  userId: z.number().int().positive(),
});

export const AssignSegmentToUserInputSchema = z.object({
  userId: z.number().int().positive(),
  segmentId: z.number().int().positive(),
});

export const RemoveSegmentFromUserInputSchema = z.object({
  userId: z.number().int().positive(),
  segmentId: z.number().int().positive(),
});

export const GetUsersBySegmentsInputSchema = z.object({
  segmentIds: z.array(z.number().int().positive()),
});

export type IGetSegmentTypes = IRequestContext;

export type ICreateSegmentType = IRequestContext & {
  input: z.infer<typeof CreateSegmentTypeInputSchema>;
};

export type IUpdateSegmentType = IRequestContext & {
  input: z.infer<typeof UpdateSegmentTypeInputSchema>;
};

export type IDeleteSegmentType = IRequestContext & {
  input: z.infer<typeof DeleteSegmentTypeInputSchema>;
};

export type IGetUserSegments = IRequestContext & {
  input: z.infer<typeof GetUserSegmentsInputSchema>;
};

export type IAssignSegmentToUser = IRequestContext & {
  input: z.infer<typeof AssignSegmentToUserInputSchema>;
};

export type IRemoveSegmentFromUser = IRequestContext & {
  input: z.infer<typeof RemoveSegmentFromUserInputSchema>;
};

export type IGetUsersBySegments = IRequestContext & {
  input: z.infer<typeof GetUsersBySegmentsInputSchema>;
};
