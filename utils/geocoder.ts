// High-fidelity Geocoding Dictionary for premium travel landmarks
// Automatically corrects coordinate placements to match real tourist maps

interface Coordinate {
  lat: number;
  lng: number;
}

const LANDMARK_COORDINATES: Record<string, Coordinate> = {
  // ─── DUBAI ────────────────────────────────────────────────────────────────
  'dubai international airport': { lat: 25.2532, lng: 55.3657 },
  'dxb': { lat: 25.2532, lng: 55.3657 },
  'burj khalifa': { lat: 25.1972, lng: 55.2744 },
  'dubai mall': { lat: 25.1985, lng: 55.2796 },
  'dubai fountain': { lat: 25.1975, lng: 55.2760 },
  'palm jumeirah': { lat: 25.1304, lng: 55.1171 },
  'atlantis the palm': { lat: 25.1304, lng: 55.1171 },
  'burj al arab': { lat: 25.1412, lng: 55.1852 },
  'jumeirah beach': { lat: 25.0763, lng: 55.1315 },
  'jbr beach': { lat: 25.0763, lng: 55.1315 },
  'dubai marina': { lat: 25.0805, lng: 55.1403 },
  'dubai creek': { lat: 25.2605, lng: 55.3176 },
  'gold souk': { lat: 25.2713, lng: 55.2974 },
  'spices souk': { lat: 25.2683, lng: 55.2954 },
  'dubai frame': { lat: 25.2356, lng: 55.3003 },
  'vida downtown': { lat: 25.1944, lng: 55.2775 },
  'vida downtown dubai': { lat: 25.1944, lng: 55.2775 },
  'museum of the future': { lat: 25.2191, lng: 55.2821 },
  'mall of the emirates': { lat: 25.1181, lng: 55.2006 },
  'ski dubai': { lat: 25.1181, lng: 55.2006 },
  'madinat jumeirah': { lat: 25.1332, lng: 55.1844 },
  'la mer': { lat: 25.2281, lng: 55.2550 },
  'al fahidi': { lat: 25.2632, lng: 55.3003 },
  'bastakiya': { lat: 25.2632, lng: 55.3003 },
  'rove downtown': { lat: 25.1973, lng: 55.2825 },
  'rove downtown dubai': { lat: 25.1973, lng: 55.2825 },
  'downtown dubai restaurants': { lat: 25.1985, lng: 55.2796 },
  'downtown dubai': { lat: 25.1985, lng: 55.2796 },

  // ─── PARIS ────────────────────────────────────────────────────────────────
  'charles de gaulle': { lat: 49.0097, lng: 2.5479 },
  'cdg airport': { lat: 49.0097, lng: 2.5479 },
  'cdg': { lat: 49.0097, lng: 2.5479 },
  'orly airport': { lat: 48.7262, lng: 2.3652 },
  'eiffel tower': { lat: 48.8584, lng: 2.2945 },
  'louvre museum': { lat: 48.8606, lng: 2.3376 },
  'louvre': { lat: 48.8606, lng: 2.3376 },
  'notre-dame': { lat: 48.8530, lng: 2.3499 },
  'notre dame': { lat: 48.8530, lng: 2.3499 },
  'arc de triomphe': { lat: 48.8738, lng: 2.2950 },
  'champs-elysees': { lat: 48.8698, lng: 2.3075 },
  'champs elysees': { lat: 48.8698, lng: 2.3075 },
  'sacre-coeur': { lat: 48.8867, lng: 2.3431 },
  'sacre coeur': { lat: 48.8867, lng: 2.3431 },
  'montmartre': { lat: 48.8867, lng: 2.3431 },
  'musee d\'orsay': { lat: 48.8600, lng: 2.3266 },
  'musee dorsay': { lat: 48.8600, lng: 2.3266 },
  'palace of versailles': { lat: 48.8049, lng: 2.1204 },
  'versailles': { lat: 48.8049, lng: 2.1204 },
  'ritz paris': { lat: 48.8681, lng: 2.3294 },
  'ritz': { lat: 48.8681, lng: 2.3294 },
  'sainte-chapelle': { lat: 48.8554, lng: 2.3450 },
  'sainte chapelle': { lat: 48.8554, lng: 2.3450 },
  'jardin du luxembourg': { lat: 48.8462, lng: 2.3371 },
  'luxembourg gardens': { lat: 48.8462, lng: 2.3371 },

  // ─── LONDON ───────────────────────────────────────────────────────────────
  'heathrow airport': { lat: 51.4700, lng: -0.4543 },
  'lhr': { lat: 51.4700, lng: -0.4543 },
  'london eye': { lat: 51.5033, lng: -0.1195 },
  'tower of london': { lat: 51.5081, lng: -0.0759 },
  'tower bridge': { lat: 51.5055, lng: -0.0754 },
  'british museum': { lat: 51.5194, lng: -0.1270 },
  'buckingham palace': { lat: 51.5014, lng: -0.1419 },
  'big ben': { lat: 51.5007, lng: -0.1246 },
  'westminster abbey': { lat: 51.4987, lng: -0.1289 },
  'hyde park': { lat: 51.5073, lng: -0.1657 },
  'tate modern': { lat: 51.5076, lng: -0.0994 },
  'shard': { lat: 51.5045, lng: -0.0865 },
  'the shard': { lat: 51.5045, lng: -0.0865 },
  'the savoy': { lat: 51.5104, lng: -0.1204 },
  'savoy hotel': { lat: 51.5104, lng: -0.1204 },

  // ─── ROME / ITALY ──────────────────────────────────────────────────────────
  'fiumicino airport': { lat: 41.8003, lng: 12.2389 },
  'fco': { lat: 41.8003, lng: 12.2389 },
  'colosseum': { lat: 41.8902, lng: 12.4922 },
  'trevi fountain': { lat: 41.9009, lng: 12.4833 },
  'pantheon': { lat: 41.8986, lng: 12.4769 },
  'vatican museums': { lat: 41.9065, lng: 12.4536 },
  'st. peter\'s basilica': { lat: 41.9022, lng: 12.4539 },
  'st peters basilica': { lat: 41.9022, lng: 12.4539 },
  'spanish steps': { lat: 41.9057, lng: 12.4823 },
  'piazza navona': { lat: 41.8989, lng: 12.4731 },
  'roman forum': { lat: 41.8925, lng: 12.4853 },
  'hotel de russie': { lat: 41.9100, lng: 12.4764 },
  'le sirenuse': { lat: 40.6282, lng: 14.4849 }, // Positano
  'positano': { lat: 40.6281, lng: 14.4850 }
};

export function geocodeLandmark(locationName: string): Coordinate | null {
  if (!locationName) return null;
  const nameLower = locationName.toLowerCase().trim();

  // 1. Exact match
  if (LANDMARK_COORDINATES[nameLower]) {
    return LANDMARK_COORDINATES[nameLower];
  }

  // 2. Contains match: if the input location contains a specific landmark name
  // e.g. "Visiting the Burj Khalifa today" contains "burj khalifa"
  // We check keys in descending order of length to match the most specific one first
  const keys = Object.keys(LANDMARK_COORDINATES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (nameLower.includes(key)) {
      return LANDMARK_COORDINATES[key];
    }
  }

  // 3. Or if the landmark name is extremely close (e.g., "Burj Al-Arab" vs "Burj Al Arab")
  // Let's normalize by removing spaces, dashes, apostrophes, etc.
  const normalize = (s: string) => s.replace(/[^a-z0-9]/g, '');
  const normInput = normalize(nameLower);
  if (normInput.length >= 3) {
    for (const key of keys) {
      const normKey = normalize(key);
      if (normInput.includes(normKey) || normKey.includes(normInput)) {
        // Only allow key.includes(input) if the input is quite specific (at least 6 chars)
        if (normKey.includes(normInput) && normInput.length < 6) {
          continue;
        }
        return LANDMARK_COORDINATES[key];
      }
    }
  }

  return null;
}
