import { protectedProcedure } from '@server/Infrastructure';
import { CertificatesServices } from '../../Application';
import { executeService, parseDateOnly } from '@server/Application';
import z from 'zod';

const filterParams = z.object({
  employee: z.string().optional(),
  date: z
    .union([z.string(), z.date()])
    .transform((arg) => parseDateOnly(arg))
    .optional(),
  type: z.number().optional(),
  year: z.number().optional(),
  status: z
    .enum(['aprobado', 'rechazado', 'pendiente', 'validando', 'eliminado'])
    .optional(),
});
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesServices) {}

  getCertificates = protectedProcedure
    .input(filterParams.optional())
    .query(
      executeService(
        this.certificatesService.getCertificates.bind(this.certificatesService),
      ),
    );

  getCertificateTypes = protectedProcedure.query(
    executeService(
      this.certificatesService.getCertificateTypes.bind(
        this.certificatesService,
      ),
    ),
  );

  addCertificate = protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        returnDate: z.string(),
        reason: z.string(),
        type: z.number(),
        requiresRest: z.boolean().optional().default(false),
      }),
    )
    .mutation(
      executeService(
        this.certificatesService.addCertificate.bind(this.certificatesService),
      ),
    );

  getCertificatesByCompany = protectedProcedure
    .input(filterParams.optional())
    .query(
      executeService(
        this.certificatesService.getCertificatesByCompany.bind(
          this.certificatesService,
        ),
      ),
    );

  getStatisticsByCertificates = protectedProcedure.query(
    executeService(
      this.certificatesService.getStatisticsByCertificates.bind(
        this.certificatesService,
      ),
    ),
  );

  getStatisticsByCertificatesMonthly = protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(
      executeService(
        this.certificatesService.getMonthlyStatisticsByCertificates.bind(
          this.certificatesService,
        ),
      ),
    );

  deleteCertificate = protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(
      executeService(
        this.certificatesService.deleteCertificate.bind(
          this.certificatesService,
        ),
      ),
    );

  updateCertificateStatus = protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['aprobado', 'rechazado', 'pendiente', 'validando']),
      }),
    )
    .mutation(
      executeService(
        this.certificatesService.updateCertificateStatus.bind(
          this.certificatesService,
        ),
      ),
    );
}
