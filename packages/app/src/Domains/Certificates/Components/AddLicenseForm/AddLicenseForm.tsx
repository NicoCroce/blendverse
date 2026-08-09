import { Button, Combobox, Container, InputField } from '@app/Application';
import { UploadFile } from '@app/Application/Components/Molecules/UploadFile';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Application/Components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useGetCertificatesTypes } from '../../Hooks';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@app/Application/Components/ui/textarea';
import { useAddLicense } from '../../Hooks/useAddLicense';
import { CERTIFICATES_ROUTES } from '../../Certificates.routes';
import { TCertificateType } from '../../Certificate.entity';
import { formSchemeAddLicense } from './AddLicenceScheme';
import { SelectField } from '@app/Application/Components/Molecules/FormFields/SelectField';
import { Input } from '@app/Application/Components/Molecules/Input';
import { Checkbox } from '@app/Application/Components/Molecules/Checkbox';

export const AddLicenseForm = () => {
  const { data: dataTypes } = useGetCertificatesTypes();
  const navigate = useNavigate();
  const { mutateAddLicence, isPendingAddLicense, appendFiles } =
    useAddLicense();

  const formLicense = useForm<z.infer<typeof formSchemeAddLicense>>({
    resolver: zodResolver(formSchemeAddLicense),
    defaultValues: {
      reason: undefined,
      type: '',
      startDate: '',
      endDate: '',
      returnDate: '',
      requiresRest: false,
      files: undefined,
    },
  });

  const options = useMemo(() => {
    return dataTypes?.map(({ id, name }: TCertificateType) => ({
      value: String(id),
      label: String(name),
    }));
  }, [dataTypes]);

  const licenseType = useWatch({ control: formLicense.control, name: 'type' });
  const hasFiles = licenseType !== '1';

  const selectedType = dataTypes?.find(
    (t: TCertificateType) => String(t.id) === licenseType,
  );
  const showRequiresRest = selectedType?.rest === true;

  const endDate = formLicense.watch('endDate');
  const minReturnDate = endDate
    ? new Date(new Date(endDate).getTime() + 86400000)
        .toISOString()
        .split('T')[0]
    : undefined;

  const handleChangeType = (value: string) => {
    formLicense.setValue('type', value);
  };

  const handleSubmit = async (values: z.infer<typeof formSchemeAddLicense>) => {
    const { id } = await mutateAddLicence(values);
    if (values.files) await appendFiles(id, values.files);
    navigate(CERTIFICATES_ROUTES);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div>
      <Form {...formLicense}>
        <form onSubmit={formLicense.handleSubmit(handleSubmit)}>
          <Container space="large">
            <SelectField
              control={formLicense.control}
              name="type"
              label="Seleccione el tipo de licencia"
              combobox={
                <Combobox options={options} onChangeValue={handleChangeType} />
              }
            ></SelectField>

            <Container>
              <Container
                justify="between"
                className="flex-col md:flex-row md:[&>*]:flex-1"
              >
                <FormField
                  name="startDate"
                  control={formLicense.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de inicio</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="block"
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="endDate"
                  control={formLicense.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de fin</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="block"
                          value={field.value || ''}
                          disabled={!formLicense.watch('startDate')}
                          min={formLicense.watch('startDate') || undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="returnDate"
                  control={formLicense.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de reintegro</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="block"
                          value={field.value || ''}
                          disabled={!formLicense.watch('endDate')}
                          min={minReturnDate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Container>
            </Container>

            {showRequiresRest && (
              <FormField
                name="requiresRest"
                control={formLicense.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Checkbox
                        label="Requiere reposo"
                        value="requiresRest"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <InputField
              control={formLicense.control}
              label="Ingrese descripción de la solicitud"
              name="reason"
            >
              <Textarea placeholder="Escriba el motivo de la solicitud" />
            </InputField>

            {hasFiles && (
              <FormField
                name="files"
                control={formLicense.control}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Cargue el archivo de la licencia</FormLabel>
                    <FormControl>
                      <UploadFile
                        value={value}
                        helperText="Arrastre la imagen aquí o haga clic para seleccionarla"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files)}
                        {...fieldProps}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <Container row justify="end">
              <Button
                appearance="cancel"
                onClick={handleCancel}
                disabled={isPendingAddLicense}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                appearance="save"
                isLoading={isPendingAddLicense}
              />
            </Container>
          </Container>
        </form>
      </Form>
    </div>
  );
};
