import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import LocationInput from './LocationInput';
import { useState } from 'react';
import { BACKEND_URL } from '@env';

type Location = {
  name: string;
  lat: number;
  lng: number;
};

export default function MultiLocationInputs() {
  const [locations, setLocations] = useState<Array<Location | null>>([
    null,
    null,
  ]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  function updateLocationAt(index: number, value: Location | null) {
    setLocations(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  function addLocationInput() {
    setLocations(prev => [...prev, null]);
  }

  function removeLocationInput(index: number) {
    setLocations(prev => prev.filter((_, i) => i !== index));
  }

  async function sendLocationsToBackend() {
    const coords = locations
      .filter(Boolean)
      .map(l => ({ lat: (l as Location).lat, lng: (l as Location).lng }));
    if (coords.length === 0) {
      setSendError('Select at least one location before sending.');
      return;
    }
    setSendError(null);
    setSendResult(null);
    setSending(true);
    try {
      const url = BACKEND_URL ?? 'http://localhost:3000/locations';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations: coords }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSendError(json?.error || JSON.stringify(json));
      } else {
        setSendResult('Successfully sent ' + coords.length + ' locations');
      }
    } catch (err: any) {
      setSendError(err?.message ?? String(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <View>
      {locations.map((loc, i) => (
        <View key={i} style={{ marginBottom: 8 }}>
          <LocationInput
            placeholder={`Where does person ${i + 1} live?`}
            onSelect={value => updateLocationAt(i, value)}
          />
          {locations.length > 1 && (
            <TouchableOpacity
              onPress={() => removeLocationInput(i)}
              style={{ alignSelf: 'flex-end', padding: 6 }}
            >
              <Text style={{ color: '#d00' }}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <TouchableOpacity
          onPress={addLocationInput}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: '#eee',
            borderRadius: 6,
            marginRight: 8,
          }}
        >
          <Text>Add location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={sendLocationsToBackend}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: '#2f95dc',
            borderRadius: 6,
          }}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff' }}>Send</Text>
          )}
        </TouchableOpacity>
      </View>

      {sendError ? (
        <Text style={{ color: 'red', marginTop: 8 }}>{sendError}</Text>
      ) : null}
      {sendResult ? (
        <Text style={{ color: 'green', marginTop: 8 }}>{sendResult}</Text>
      ) : null}
    </View>
  );
}
