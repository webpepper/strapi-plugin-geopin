import { Box, Grid, Typography } from '@strapi/design-system';
import LocationInputForm from './Form';
import LocationMap from './Map';

const parseValue = (value: any): { lat: number | null; lng: number | null } => {
  if (value) {
    if (typeof value === 'string') {
      return JSON.parse(value);
    } else if (typeof value === 'object' && value !== null) {
      return value;
    }
  }

  return { lat: null, lng: null };
};

interface LocationInputProps {
  attribute: Record<string, any>;
  error: any;
  rawError: any;
  hint: string;
  label: string;
  mainField: any;
  name: string;
  placeholder: string;
  type: string;
  onChange: (value: any) => void;
  disabled: boolean;
  required: boolean;
  unique: boolean;
  initialValue: any;
  value: any;
}

const LocationInput = (props: LocationInputProps) => {
  const { value, onChange, name, attribute } = props;

  const { lat, lng } = parseValue(value);

  const handleSetLocation = (v: { lat?: number | null; lng?: number | null }) => {
    const newValue = {
      lat: 'lat' in v ? v.lat : lat,
      lng: 'lng' in v ? v.lng : lng,
    };

    onChange({
      target: {
        name,
        value: JSON.stringify(newValue),
        type: attribute.type,
      },
    });
  };

  return (
    <Box>
      <Typography fontWeight="bold" variant="pi">
        {name}
      </Typography>
      <Grid.Root gap={5}>
        <LocationInputForm lat={lat} lng={lng} handleSetLocation={handleSetLocation} />
        <Grid.Item col={12}>
          <LocationMap lat={lat} lng={lng} handleSetLocation={handleSetLocation} />
        </Grid.Item>
      </Grid.Root>
    </Box>
  );
};

export default LocationInput;
