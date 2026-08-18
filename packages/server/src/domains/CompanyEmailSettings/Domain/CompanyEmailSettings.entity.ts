import type {
  CompanyEmailSettingsDraft,
  CompanyEmailSettingsSnapshot,
  DeliverySetting,
  RecipientSetting,
  ReportSectionSetting,
  TermsVersion,
} from './CompanyEmailSettings.types';
import { CompanyEmailSettingsDomainError } from './CompanyEmailSettings.errors';

export class CompanyEmailSettings {
  private constructor(
    private readonly snapshot: CompanyEmailSettingsSnapshot,
  ) {}

  static create(snapshot: CompanyEmailSettingsSnapshot): CompanyEmailSettings {
    if (snapshot.version < 1 || snapshot.ownerId < 1) {
      throw new CompanyEmailSettingsDomainError(
        'Configuración de email inválida',
        500,
        'PERSISTENCE_ERROR',
      );
    }
    return new CompanyEmailSettings(snapshot);
  }

  get values(): CompanyEmailSettingsSnapshot {
    return {
      ...this.snapshot,
      deliveries: [...this.snapshot.deliveries],
      recipients: [...this.snapshot.recipients],
      reportSections: [...this.snapshot.reportSections],
    };
  }

  toJSON(): CompanyEmailSettingsSnapshot {
    return this.values;
  }

  static draftFrom(
    snapshot: CompanyEmailSettingsSnapshot,
    draft: CompanyEmailSettingsDraft,
  ) {
    return {
      ...snapshot,
      deliveries: draft.delivery.map(
        (item): DeliverySetting => ({
          ...item,
          ...({} as Pick<DeliverySetting, 'audience' | 'trigger'>),
        }),
      ),
      recipients: draft.adminRecipients.map(
        (item): RecipientSetting => ({
          email: item.email,
          normalizedEmail: item.email.trim().toLowerCase(),
          source: 'manual',
        }),
      ),
      reportSections: draft.reportSections.map(
        (item): ReportSectionSetting => ({ ...item }),
      ),
      welcomeMessage: draft.welcomeMessage,
    };
  }

  static withTerms(
    snapshot: CompanyEmailSettingsSnapshot,
    currentTerms: TermsVersion,
  ): CompanyEmailSettingsSnapshot {
    return { ...snapshot, currentTerms };
  }
}
