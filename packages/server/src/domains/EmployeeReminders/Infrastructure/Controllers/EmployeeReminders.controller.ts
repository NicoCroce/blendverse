import { protectedProcedure } from '@server/Infrastructure';
import { executeServiceAlone } from '@server/Application';
import { EmployeeRemindersService } from '../../Application';

/**
 * Controller de los recordatorios de empleados. Expone el trigger manual
 * (testing/debug) que dispara el envío de recordatorios de todas las
 * empresas, replicando `DailyReport.generateManual`.
 */
export class EmployeeRemindersController {
  constructor(
    private readonly employeeRemindersService: EmployeeRemindersService,
  ) {}

  sendDailyReminders = protectedProcedure.mutation(
    executeServiceAlone(
      this.employeeRemindersService.sendDailyReminders.bind(
        this.employeeRemindersService,
      ),
    ),
  );
}
