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

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

  const res = await fetch(`${baseUrl}/api/users/location/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ latitude, longitude, source }),
  });

  if (!res.ok) {
    // Safely parse — backend may return HTML (e.g. 401 redirect) instead of JSON
    let msg = 'Failed to update location';
    try {
      const err = await res.json();
      msg = err.error || msg;
    } catch {
      // response was not JSON — ignore
    }
    throw new Error(msg);
  }
}