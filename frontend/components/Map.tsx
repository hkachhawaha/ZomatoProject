"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import { RestaurantRecommendation } from '@/types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  restaurants: RestaurantRecommendation[];
  center?: [number, number];
  zoom?: number;
}

export default function Map({ restaurants, center = [12.9716, 77.5946], zoom = 12 }: MapProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {restaurants.map((restaurant, index) => (
          restaurant.latitude && restaurant.longitude ? (
            <Marker key={index} position={[restaurant.latitude, restaurant.longitude]}>
              <Popup>
                <div>
                  <strong>{restaurant.name}</strong><br />
                  <span>Cuisine: {restaurant.cuisine}</span><br />
                  <span>Rating: {restaurant.rating}/5</span><br />
                  <span>Cost: {restaurant.cost}</span><br />
                  <p style={{ marginTop: '8px', fontSize: '14px' }}>{restaurant.explanation}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}