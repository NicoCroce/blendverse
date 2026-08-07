import { employeeRemindersController } from '../../employeeReminders.di';

export const EmployeeRemindersRoutes = () => {
  const { sendDailyReminders } = employeeRemindersController();

  return {
    employeeReminders: {
      sendDailyReminders,
    },
  };
};
