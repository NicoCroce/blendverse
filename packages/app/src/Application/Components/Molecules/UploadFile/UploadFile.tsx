import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, File as FileIcon, UploadCloud } from 'lucide-react';
import { cn } from '@app/Application/lib/utils';

export interface UploadFileProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value'
> {
  value?: FileList | null;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
}

export const UploadFile = React.forwardRef<HTMLInputElement, UploadFileProps>(
  (
    {
      value,
      helperText = 'Arrastre la imagen aquí o haga clic para seleccionarla',
      accept = 'image/*',
      multiple = true,
      onChange,
      className,
      ...props
    },
    ref,
  ) => {
    const [dragActive, setDragActive] = useState(false);

    const files = useMemo(() => (value ? Array.from(value) : []), [value]);

    const previews = useMemo(
      () =>
        files.map((file) => ({
          name: file.name,
          url: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : undefined,
        })),
      [files],
    );

    useEffect(() => {
      return () => {
        previews.forEach((preview) => {
          if (preview.url) URL.revokeObjectURL(preview.url);
        });
      };
    }, [previews]);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(true);
    };

    const handleDragLeave = () => {
      setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        const syntheticEvent = {
          target: { files: e.dataTransfer.files },
          currentTarget: { files: e.dataTransfer.files },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
      }
    };

    return (
      <div className="flex flex-col gap-3">
        <label
          className={cn(
            'group relative flex min-h-[12rem] cursor-pointer flex-col items-center justify-center gap-5 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors focus-within:ring-2 focus-within:ring-ring',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-input bg-muted/30 hover:border-primary hover:bg-primary/5',
            className,
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span className="flex h-18 w-18 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110 motion-reduce:transform-none">
            <UploadCloud className="h-9 w-9" strokeWidth={1.75} />
          </span>
          <span className="flex flex-col gap-1">
            {files.length > 0 ? (
              <>
                <span className="text-base font-medium text-foreground">
                  {files.length === 1
                    ? '1 archivo cargado'
                    : `${files.length} archivos cargados`}
                </span>
                <span className="text-sm text-primary">
                  Arrastre o haga clic para agregar más archivos
                </span>
              </>
            ) : (
              <>
                <span className="text-base font-medium text-foreground">
                  {helperText}
                </span>
                <span className="text-sm text-muted-foreground">
                  PNG, JPG o WebP
                </span>
              </>
            )}
          </span>
          <input
            ref={ref}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={onChange}
            {...props}
          />
        </label>

        {files.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2} />
              {files.length === 1
                ? '1 archivo listo para enviar'
                : `${files.length} archivos listos para enviar`}
            </span>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-2">
              {previews.map((preview, index) => (
                <div
                  key={`${preview.name}-${index}`}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-background">
                    {preview.url ? (
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileIcon
                        className="h-6 w-6 text-muted-foreground"
                        strokeWidth={1.75}
                      />
                    )}
                  </div>
                  <span
                    className="w-16 truncate text-center text-[11px] text-muted-foreground"
                    title={preview.name}
                  >
                    {preview.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

UploadFile.displayName = 'UploadFile';
