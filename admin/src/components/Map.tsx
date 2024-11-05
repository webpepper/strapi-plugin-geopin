import { Box, Button, Grid, Modal, Typography } from '@strapi/design-system';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
//@ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
//@ts-ignore
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import LocationInputForm from './Form';
import LocationTextInput from './Search';

const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
});

interface LocationMapProps {
  lat: number | null;
  lng: number | null;
  handleSetLocation: (value: { lat?: number | null; lng?: number | null }) => void;
}

const LocationMap = (props: LocationMapProps) => {
  const { lat: inputLat, lng: inputLng, handleSetLocation } = props;

  const [{ lat, lng, zoom }, setLocation] = useState({
    lat: inputLat,
    lng: inputLng,
    zoom: inputLat !== 0 || inputLng !== 0 ? 18 : 12,
  });

  const markerRef = useRef<L.Marker>(null);

  const LocationFinderDummy = () => {
    const map = useMap();

    // Helps position the marker on the map on map click
    useMapEvents({
      click(e) {
        setLocation((s) => ({ ...s, lat: e.latlng.lat, lng: e.latlng.lng }));
      },
    });

    // Helps center map when position change either via address search or input field change
    useEffect(() => {
      map.setView([lat ?? 0, lng ?? 0], zoom);
    }, [lat, lng, zoom]);

    return null;
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat: newLat, lng: newLng } = marker.getLatLng();
          setLocation((s) => ({ ...s, lat: newLat, lng: newLng }));
        }
      },
    }),
    []
  );

  const confirmLocation = () => {
    handleSetLocation({ lat, lng });
  };

  // sync with props
  useEffect(() => {
    setLocation((s) => ({ ...s, lat: inputLat, lng: inputLng }));
  }, [inputLat, inputLng]);

  return (
    <Modal.Root>
      <Modal.Trigger>
        <Button>Open map</Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Header>
          <Typography fontWeight="bold" textColor="neutral800" id="title">
            Location
          </Typography>
        </Modal.Header>
        <Modal.Body>
          <Grid.Root gap={5} className="pb-2">
            <LocationInputForm
              lat={lat}
              lng={lng}
              handleSetLocation={(newValue) => setLocation((s) => ({ ...s, ...newValue }))}
            />
          </Grid.Root>
          <LocationTextInput
            handleSetLocation={(newValue) => setLocation((s) => ({ ...s, ...newValue }))}
          />
          <Box paddingTop={6}>
            <MapContainer
              center={[lat ?? 0, lng ?? 0]}
              zoom={zoom}
              scrollWheelZoom
              style={{ height: '300px' }}
              dragging
              zoomAnimation
              preferCanvas
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                draggable
                eventHandlers={eventHandlers}
                ref={markerRef}
                position={[lat ?? 0, lng ?? 0]}
                icon={icon}
              />
              <LocationFinderDummy />
            </MapContainer>
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close>
            <Button variant="tertiary">Cancel</Button>
          </Modal.Close>
          <Modal.Trigger>
            <Button onClick={confirmLocation}>Confirm</Button>
          </Modal.Trigger>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default LocationMap;
