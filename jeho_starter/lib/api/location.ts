export async function sendLocationToBackend(
  latitude: number,
  longitude: number,
  source: 'gps' | 'ip' | 'manual' = 'gps'
): Promise<void> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    console.warn('[Location] No auth token — skipping location update');
    return;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/location/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ latitude, longitude, source }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update location');
  }
}