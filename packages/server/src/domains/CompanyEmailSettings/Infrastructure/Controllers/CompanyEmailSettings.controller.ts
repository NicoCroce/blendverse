import { executeService, executeServiceAlone } from '@server/Application';
import { protectedProcedure } from '@server/Infrastructure/trpc';
import { CompanyEmailSettingsService } from '../../Application';
import {
  auditQuerySchema,
  publishTermsSchema,
  updateCompanyEmailSettingsSchema,
} from '../../Application/companyEmailSettings.types';

export class CompanyEmailSettingsController {
  constructor(
    private readonly companyEmailSettingsService: CompanyEmailSettingsService,
  ) {}

  get = protectedProcedure.query(
    executeServiceAlone(
      this.companyEmailSettingsService.get.bind(
        this.companyEmailSettingsService,
      ),
    ),
  );

  update = protectedProcedure
    .input(updateCompanyEmailSettingsSchema)
    .mutation(
      executeService(
        this.companyEmailSettingsService.update.bind(
          this.companyEmailSettingsService,
        ),
      ),
    );

  publishTerms = protectedProcedure
    .input(publishTermsSchema)
    .mutation(
      executeService(
        this.companyEmailSettingsService.publishTerms.bind(
          this.companyEmailSettingsService,
        ),
      ),
    );

  getAudit = protectedProcedure
    .input(auditQuerySchema)
    .query(
      executeService(
        this.companyEmailSettingsService.getAudit.bind(
          this.companyEmailSettingsService,
        ),
      ),
    );
}
