import { Request, Response } from 'express';
import fetch from 'node-fetch';

const USER_AGENT = 'CefaloTravelConnect/1.0 (sabbirhossain567821@gmail.com)';

export async function searchLocationHandler(req: Request, res: Response) {
  const query = req.query.q as string;

  if (!query || !query.trim()) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=en`,
      {
        headers: {
          'User-Agent': USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to fetch from Nominatim' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error searching location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function reverseGeocodeHandler(req: Request, res: Response) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`,
      {
        headers: {
          'User-Agent': USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to reverse geocode' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
