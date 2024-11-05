import { Button, Field, Grid, TextInput } from '@strapi/design-system';
import { useState } from 'react';
import pkg from '../../../package.json';

export default function LocationTextInput({
  handleSetLocation,
}: {
  handleSetLocation: (value: { lat: number; lng: number }) => void;
}) {
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    const headers = new Headers();
    // important to avoid 403 errors and to follow requirements https://operations.osmfoundation.org/policies/nominatim/
    headers.append('User-Agent', `${pkg.name}/${pkg.version}`);

    const url = encodeURI(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);

    try {
      const response = await fetch(url, {
        headers,
      });
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        handleSetLocation({ lat: Number(lat), lng: Number(lon) });
        setErrorMsg('');
      } else {
        setErrorMsg('Address not found');
      }
    } catch (e) {
      setErrorMsg('Request error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        fetchData();
      }}
    >
      <Grid.Root gap={5} style={{ padding: '16px 0' }}>
        <Grid.Item col={10}>
          <Field.Root style={{ width: '100%' }} error={errorMsg}>
            <Field.Label>Address</Field.Label>
            <TextInput
              placeholder="enter an address"
              name="address"
              onChange={(e: any) => {
                setAddress(e?.target?.value);
              }}
            />
            <Field.Error />
            <Field.Hint />
          </Field.Root>
        </Grid.Item>
        <Grid.Item
          col={2}
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '24px',
          }}
        >
          <Button type="submit" variant="default" fullWidth loading={loading}>
            Search
          </Button>
        </Grid.Item>
      </Grid.Root>
    </form>
  );
}
