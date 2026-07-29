import { toast } from 'sonner';
import { CertificatesService } from '../Certificates.service';
import { z } from 'zod';
import { formSchemeAddLicense } from '../Components/AddLicenseForm';
import ApiService from '@app/Infrastructure/Services/AxiosApi';
import { ICertificate } from '../Certificate.entity';

export const useAddLicense = () => {
  const { mutate, isPending } = CertificatesService.addCertificate.useMutation({
    onError: (err, _variables) => toast.error(err.message),
    onSuccess: (data) => {
      toast.success('Licencia agregada');
      return data;
    },
  });

  const mutateAddLicence = (
    data: z.infer<typeof formSchemeAddLicense>,
  ): Promise<ICertificate> => {
    const { startDate, endDate, returnDate, type, requiresRest } = data;

    // Crear una promesa que se resolverá con los datos de la respuesta
    return new Promise((resolve, reject) => {
      mutate(
        {
          ...data,
          startDate,
          endDate,
          returnDate,
          type: Number(type),
          requiresRest: requiresRest ?? false,
        },
        {
          onSuccess: (responseData) => {
            // Resolver la promesa con los datos de la respuesta
            resolve(responseData);
          },
          onError: (error) => {
            // Rechazar la promesa con el error
            reject(error);
          },
        },
      );
    });
  };

  const appendFiles = async (id: number, files: FileList) => {
    const fileList = Array.from(files);
    const total = fileList.length;

    toast.info(total === 1 ? 'Cargando archivo' : `Cargando ${total} archivos`);

    let uploaded = 0;
    let failed = 0;

    // El endpoint acepta un archivo por request y los va agregando al
    // certificado, por eso se sube cada archivo por separado.
    for (const file of fileList) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await ApiService.uploadFile(`/express/load/${id}`, formData);
        uploaded += 1;
      } catch {
        failed += 1;
      }
    }

    if (uploaded > 0) {
      toast.success(
        uploaded === 1
          ? '1 archivo cargado correctamente'
          : `${uploaded} archivos cargados correctamente`,
      );
    }

    if (failed > 0) {
      toast.error(
        failed === 1
          ? '1 archivo no pudo cargarse'
          : `${failed} archivos no pudieron cargarse`,
      );
    }
  };

  return {
    mutateAddLicence,
    isPendingAddLicense: isPending,
    appendFiles,
  };
};
