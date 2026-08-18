import { IRequestContext } from '@server/Application';
import { z } from 'zod';

// ─── Schemas (espejo del contrato en specs/) ──────────────────────────────────

export const GetEmpresasByUsuarioInputSchema = z.object({
  userId: z.number().int().positive(),
});

export const EmpresaItemSchema = z.object({
  id: z.number().int().positive(),
  denominacion: z.string(),
  logo: z.string().nullable(),
});

export const GetEmpresasByUsuarioOutputSchema = z.array(EmpresaItemSchema);

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type EmpresaItem = z.infer<typeof EmpresaItemSchema>;
export type IGetEmpresasByUsuarioOutput = z.infer<
  typeof GetEmpresasByUsuarioOutputSchema
>;

export type IGetEmpresasByUsuarioInput = IRequestContext & {
  input: z.infer<typeof GetEmpresasByUsuarioInputSchema>;
};

// ─── SelectEmpresa ────────────────────────────────────────────────────────────

export const SelectEmpresaInputSchema = z.object({
  empresaId: z.number().int().positive(),
});

export const SelectEmpresaOutputSchema = z.object({
  token: z.string(),
  ownerId: z.number(),
});

export type ISelectEmpresaInput = IRequestContext & {
  input: z.infer<typeof SelectEmpresaInputSchema>;
};

export type ISelectEmpresaOutput = z.infer<typeof SelectEmpresaOutputSchema>;
