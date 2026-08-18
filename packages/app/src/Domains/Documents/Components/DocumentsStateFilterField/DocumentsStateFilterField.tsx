import { Container } from '@app/Application';
import { Label } from '@app/Application/Components/ui/label';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@app/Application/Components/ui/toggle-group';
import {
  DOCUMENT_STATES,
  PENDING,
  UNDER_CONFORMITY,
  WITHOUT_CONFORMITY,
  TStateDocument,
} from '../../Document.entity';

type DocumentsStateFilterFieldProps = {
  value: TStateDocument;
  onChange: (value: TStateDocument) => void;
};

const DOCUMENT_STATE_LABELS: Record<(typeof DOCUMENT_STATES)[number], string> =
  {
    [PENDING]: 'Pendientes',
    [UNDER_CONFORMITY]: 'Firmados bajo conformidad',
    [WITHOUT_CONFORMITY]: 'Firmados sin conformidad',
  };

const buttonGroupActiveClass =
  'data-[state=on]:!bg-primary data-[state=on]:!text-secondary';

export const DocumentsStateFilterField = ({
  value,
  onChange,
}: DocumentsStateFilterFieldProps) => {
  return (
    <Container space="small">
      <Label>Estado de conformidad</Label>
      <ToggleGroup
        type="single"
        variant="outline"
        className="justify-start gap-4 flex-wrap"
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) onChange(nextValue as TStateDocument);
        }}
      >
        {DOCUMENT_STATES.map((state) => (
          <ToggleGroupItem
            key={state}
            value={state}
            className={buttonGroupActiveClass}
          >
            {DOCUMENT_STATE_LABELS[state]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Container>
  );
};
