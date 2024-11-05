import { Field, Grid, TextInput } from '@strapi/design-system';
import { ChangeEvent } from 'react';
import { styled } from 'styled-components';

// NumberInput likely has a bug because it doesn't always update the displayed value based on input.
// It's supposed to act as a controlled input but it does't always do that.
// This is a workaround to simply use a regular input field but additionally hide the step buttons.
const Input = styled(TextInput)`
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }
`;

interface InputFormProps {
  lat: number | null;
  lng: number | null;
  handleSetLocation: (value: { lat?: number | null; lng?: number | null }) => void;
}

const InputForm = (props: InputFormProps) => {
  const { lat, lng, handleSetLocation } = props;

  return (
    <>
      <Grid.Item col={6}>
        <Field.Root style={{ width: '100%' }}>
          <Field.Label>Latitude</Field.Label>
          <Input
            type="number"
            value={lat ?? ''}
            step="0.001"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const v = e.target.valueAsNumber;
              handleSetLocation({ lat: Number.isNaN(v) ? null : v });
            }}
          />
          <Field.Error />
          <Field.Hint />
        </Field.Root>
      </Grid.Item>
      <Grid.Item col={6}>
        <Field.Root style={{ width: '100%' }}>
          <Field.Label>Longitude</Field.Label>
          <Input
            type="number"
            value={lng ?? ''}
            step="0.001"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const v = e.target.valueAsNumber;
              handleSetLocation({ lng: Number.isNaN(v) ? null : v });
            }}
          />
          <Field.Error />
          <Field.Hint />
        </Field.Root>
      </Grid.Item>
    </>
  );
};

export default InputForm;
