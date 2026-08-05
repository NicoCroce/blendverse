import { toast } from 'sonner';
import { AdminDisclaimerService } from '../Admin.service';

export const useGetEmployees = () => {
  return AdminDisclaimerService.getEmployees.useQuery;
};

export const useSendReminders = () => {
  return AdminDisclaimerService.sendReminders.useMutation({
    onError: ({ message }: { message: string }) => toast.error(message),
    onSuccess: (data: { sent: number; failed: number; total: number }) => {
      toast.success(
        `Recordatorios enviados: ${data.sent} exitosos, ${data.failed} fallidos`,
      );
    },
  });
};
