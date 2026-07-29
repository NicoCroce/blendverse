import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Input } from '@app/Application/Components/ui/input';
import { useUpdateSegmentType } from '../Application/segments.queries';
import type { TSegmentType } from '../Domain/segments.types';

interface SegmentInlineNameProps {
  segment: TSegmentType;
}

export const SegmentInlineName = ({ segment }: SegmentInlineNameProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(segment.nombre);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateSegmentType();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === segment.nombre) {
      setValue(segment.nombre);
      setEditing(false);
      return;
    }
    updateMutation.mutate(
      { id: segment.id, nombre: trimmed },
      {
        onSuccess: () => {
          toast.success('Segmento renombrado');
          setEditing(false);
        },
        onError: (err) => {
          toast.error(err.message ?? 'Error al renombrar');
          setValue(segment.nombre);
          setEditing(false);
        },
      },
    );
  }, [value, segment, updateMutation]);

  const cancel = useCallback(() => {
    setValue(segment.nombre);
    setEditing(false);
  }, [segment.nombre]);

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') cancel();
        }}
        className="h-8 text-sm font-medium px-2 py-1"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setValue(segment.nombre);
        setEditing(true);
      }}
      className="group flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer rounded-md -ml-2 px-2 py-1 hover:bg-accent transition-colors"
    >
      <span>{segment.nombre}</span>
      <svg
        className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
        />
      </svg>
    </button>
  );
};
