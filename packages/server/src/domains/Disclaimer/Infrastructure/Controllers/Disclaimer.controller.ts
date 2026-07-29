import { protectedProcedure } from '@server/Infrastructure';
import { DisclaimerService } from '../../Application';
import { executeService } from '@server/Application';
import z from 'zod';

export class DisclaimerController {
  constructor(private disclaimerService: DisclaimerService) {}

  getText = () =>
    protectedProcedure
      .input(z.number().min(1, 'ownerId is required'))
      .query(
        executeService(
          this.disclaimerService.getDisclaimerText.bind(this.disclaimerService),
        ),
      );

  getStatus = () =>
    protectedProcedure
      .input(
        z.object({
          userId: z.number().min(1),
          ownerId: z.number().min(1),
        }),
      )
      .query(
        executeService(
          this.disclaimerService.getSignatureStatus.bind(
            this.disclaimerService,
          ),
        ),
      );

  sign = () =>
    protectedProcedure
      .input(
        z.object({
          password: z.string().min(1, 'Password is required'),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const ip =
          (ctx as unknown as { req?: { ip?: string } }).req?.ip || '0.0.0.0';
        const userAgent =
          (ctx as unknown as { req?: { headers?: Record<string, string> } }).req
            ?.headers?.['user-agent'] || null;

        return executeService(
          this.disclaimerService.signDisclaimer.bind(this.disclaimerService),
        )({
          ctx: ctx as never,
          input: { password: input.password, ip, userAgent },
        });
      });

  getEmployees = () =>
    protectedProcedure
      .input(
        z.object({
          ownerId: z.number().optional(),
          search: z.string().optional().default(''),
          page: z.string().optional(),
          limit: z.string().optional(),
          withoutSegments: z.boolean().optional().default(false),
          segmentIds: z.array(z.number().int().positive()).optional(),
        }),
      )
      .query(
        executeService(
          this.disclaimerService.getEmployeesByCompany.bind(
            this.disclaimerService,
          ),
        ),
      );

  sendReminders = () =>
    protectedProcedure
      .input(
        z.object({
          ownerId: z.number().optional(),
          employeeIds: z.array(z.number()).optional(),
        }),
      )
      .mutation(
        executeService(
          this.disclaimerService.sendReminders.bind(this.disclaimerService),
        ),
      );
}
