import { IDailyReport, IDailyReportSections } from './DailyReport.types';

/**
 * DTO de salida (no persistente) que agrupa las 7 secciones del reporte
 * diario para una empresa específica.
 */
export class DailyReport {
  constructor(
    protected readonly _ownerId: number,
    protected readonly _companyName: string,
    protected readonly _date: string,
    protected readonly _sections: IDailyReportSections,
    protected readonly _selectedSections?: readonly string[],
  ) {}

  static create({
    ownerId,
    companyName,
    date,
    sections,
    selectedSections,
  }: IDailyReport): DailyReport {
    return new DailyReport(
      ownerId,
      companyName,
      date,
      sections,
      selectedSections,
    );
  }

  toJSON() {
    return this.values;
  }

  get values() {
    return {
      ownerId: this._ownerId,
      companyName: this._companyName,
      date: this._date,
      sections: this._sections,
      selectedSections: this._selectedSections,
    };
  }
}
