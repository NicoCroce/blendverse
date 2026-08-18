import { z } from 'zod';

// ─── Input ────────────────────────────────────────────────────────────────────

export const GetEmpresasByUsuarioInputSchema = z.object({
  userId: z.number().int().positive('userId debe ser un entero positivo'),
});

// ─── Output ───────────────────────────────────────────────────────────────────

export const EmpresaItemSchema = z.object({
  id: z.number().int().positive(),
  razon_social: z.string(),
  cuit: z.number().int(),
  logo: z.string().nullable(),
});

export const GetEmpresasByUsuarioOutputSchema = z.array(EmpresaItemSchema);

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type GetEmpresasByUsuarioInput = z.infer<
  typeof GetEmpresasByUsuarioInputSchema
>;
export type EmpresaItem = z.infer<typeof EmpresaItemSchema>;
export type GetEmpresasByUsuarioOutput = z.infer<
  typeof GetEmpresasByUsuarioOutputSchema
>;
