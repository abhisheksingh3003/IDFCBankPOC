import { Destination, Essential, Hotel, Flight, Activity, Curation } from './types';

const AMENITIES = ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Air Conditioning'];

export const ITALY_HOTELS: Hotel[] = [
  {
    id: 'h-ita-1',
    name: 'Rome Cavalieri, A Waldorf Astoria Hotel',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 850,
    description: 'Set in a 15-acre private Mediterranean park overlooking Rome and the Vatican. Near Policlinico Gemelli (1.5km).',
    amenities: ['Outdoor Pool', 'Grand Spa', 'Michelin Star Dining', 'Kids Club'],
    address: 'Via Alberto Cadlolo, 101, 00136 Rome, Italy',
    isVerified: true
  },
  {
    id: 'h-ita-2',
    name: 'Hotel Hassler Roma',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1200,
    description: 'Legendary luxury hotel setting at the top of the Spanish Steps. Near Ospedale Fatebenefratelli (2km).',
    amenities: ['Panoramic Views', 'Imàgo Restaurant', 'Amorvero SPA'],
    address: 'Piazza della Trinità dei Monti, 6, 00187 Rome, Italy',
    isVerified: true
  },
  {
    id: 'h-ita-3',
    name: 'Hotel de Russie',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 950,
    description: 'A benchmark of classic luxury with a stunning Secret Garden. Near Ospedale Santo Spirito (1.5km).',
    amenities: ['Secret Garden', 'De Russie Spa', 'Stravinskij Bar'],
    address: 'Via del Babuino, 9, 00187 Rome, Italy'
  },
  {
    id: 'h-ita-4',
    name: 'The St. Regis Rome',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 800,
    description: 'A historic palace offering regal grandeur and timeless elegance near Piazza della Repubblica. Near Policlinico Umberto I (1km).',
    amenities: ['Butler Service', 'Lumen Cocktails', 'Kami Spa'],
    address: 'Via Vittorio Emanuele Orlando, 3, 00185 Rome, Italy'
  },
  {
    id: 'h-ita-5',
    name: 'J.K. Place Roma',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1100,
    description: 'An intimate boutique hotel with uniquely designed rooms, blending classic and contemporary art. Near Ospedale Santo Spirito (1km).',
    amenities: ['JK Cafe', 'Rooftop Terrace', 'Bespoke Service'],
    address: 'Via di Monte d\'Oro, 30, 00186 Rome, Italy'
  },
  {
    id: 'h-ita-6',
    name: 'Bulgari Hotel Roma',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1500,
    description: 'A new standard of luxury paying homage to Rome’s imperial past, near the Mausoleum of Augustus. Near Ospedale Fatebenefratelli (1.5km).',
    amenities: ['Bulgari Spa', 'Il Ristorante', 'Reading Room'],
    address: 'Piazza Augusto Imperatore, 10, 00186 Rome, Italy'
  },
  {
    id: 'h-ita-7',
    name: 'Hotel Eden',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1050,
    description: 'Offering an authentic Roman experience with spectacular city views and acclaimed dining. Near Policlinico Umberto I (2km).',
    amenities: ['La Terrazza', 'The Eden Spa', 'Il Giardino'],
    address: 'Via Ludovisi, 49, 00187 Rome, Italy'
  },
  {
    id: 'h-ita-8',
    name: 'Palazzo Manfredi',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 750,
    description: 'Wake up to the Colosseum right outside your window in this stylish boutique hotel. Near Ospedale San Giovanni Addolorata (1km).',
    amenities: ['Aroma Restaurant', 'Colosseum Views', 'Grand Suites'],
    address: 'Via Labicana, 125, 00184 Rome, Italy'
  },
  {
    id: 'h-ita-9',
    name: 'Anantara Palazzo Naiadi',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 850,
    description: 'A majestic marble palace suspended over the ruins of the Baths of Diocletian. Near Policlinico Umberto I (1km).',
    amenities: ['Rooftop Plunge Pool', 'Anantara Spa', 'Tazio Restaurant'],
    address: 'Piazza della Repubblica, 48, 00185 Rome, Italy'
  }
];

export const PARIS_HOTELS: Hotel[] = [
  {
    id: 'h-par-1',
    name: 'Ritz Paris',
    rating: 5.0,
    imageUrl: 'https://lh3.googleusercontent.com/p/AF1QipOGc60G4qmJ2x_BDc-LYLTvvO6UTzTTg45Dr5sB=w324-h312-n-k-no',
    pricePerNight: 2100,
    description: 'An emblem of French art de vivre, offering a refined atmosphere and the highest standard of luxury.',
    amenities: ['Gourmet Dining', 'Spa', 'Pool', 'Garden', 'Limousine Service'],
    address: '15 Pl. Vendôme, 75001 Paris, France'
  },
  {
    id: 'h-par-2',
    name: 'Hôtel Plaza Athénée',
    rating: 4.9,
    imageUrl: 'https://lh3.googleusercontent.com/p/AF1QipOTDVkqWhpatu6_LdpcgPgggPu44rYaAK_OK1ur=s680-w680-h510-rw',
    pricePerNight: 1600,
    description: 'Iconic luxury hotel on the prestigious Avenue Montaigne, featuring its famous red awnings and geranium-filled balconies.',
    amenities: ['Haute Couture Spa', 'Michelin Dining', 'Eiffel View Rooms'],
    address: '25 Av. Montaigne, 75008 Paris, France'
  },
  {
    id: 'h-par-3',
    name: 'Le Meurice',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1450,
    description: 'A palace of the heart of historic Paris, combining 18th-century opulence with contemporary flair.',
    amenities: ['Tuileries View', 'Dali Bar', 'Valmont Spa'],
    address: '228 Rue de Rivoli, 75001 Paris, France'
  },
  {
    id: 'h-par-4',
    name: 'Shangri-La Paris',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1550,
    description: 'Formerly the home of Prince Roland Bonaparte, offering regal service and spectacular views of the Eiffel Tower.',
    amenities: ['Michelin Dining', 'Palace Service', 'Pool', 'Terrace'],
    address: '10 Av. d\'Iéna, 75116 Paris, France'
  },
  {
    id: 'h-par-5',
    name: 'Four Seasons George V',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1950,
    description: 'Just steps from the Champs-Elysées, featuring private terraces and world-renowned flower displays.',
    amenities: ['3-Star Michelin', 'Fitness Club', 'Luxury Spa'],
    address: '31 Av. George V, 75008 Paris, France'
  },
  {
    id: 'h-par-6',
    name: 'Mandarin Oriental, Paris',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1250,
    description: 'A haven of elegance and understated luxury in the heart of the city\'s haute couture district.',
    amenities: ['Garden Patio', 'Holistic Spa', 'Modern Design'],
    address: '251 Rue St Honoré, 75001 Paris, France'
  },
  {
    id: 'h-par-7',
    name: 'Le Bristol Paris',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1750,
    description: 'An icon of French elegance and art de vivre since 1925, located on the prestigious rue du Faubourg Saint-Honoré.',
    amenities: ['Rooftop Pool', 'Garden', 'Tea Service'],
    address: '112 Rue du Faubourg Saint-Honoré, 75008 Paris, France'
  },
  {
    id: 'h-par-8',
    name: 'Park Hyatt Vendôme',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1350,
    description: 'One of the most visually stunning hotels in Paris, blending contemporary design with classic architecture.',
    amenities: ['Open Kitchen', 'Luxury Spa', 'Anya Service'],
    address: '5 Rue de la Paix, 75002 Paris, France'
  },
  {
    id: 'h-par-9',
    name: 'The Peninsula Paris',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1850,
    description: 'A masterfully restored 19th-century classic building, bringing a new level of distinction to the City of Light.',
    amenities: ['Rooftop Dining', 'Fleet of BMWs', 'Extensive Spa'],
    address: '19 Av. Kléber, 75116 Paris, France'
  }
];

export const ITALY_ACTIVITIES: Activity[] = [
  {
    id: 'a-ita-1',
    name: 'Colosseum & Roman Forum Tour',
    duration: '3 hours',
    price: 65,
    category: 'History',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400',
    isPopular: true,
    isMostVisited: true
  },
  {
    id: 'a-ita-2',
    name: 'Gladiator School for Kids',
    duration: '2 hours',
    price: 120,
    category: 'Adventure',
    imageUrl: 'https://wowromewithkids.com/wp-content/uploads/2021/03/roman-gladiator-school-in-Rome.jpg',
    isPopular: true
  },
  {
    id: 'a-ita-3',
    name: 'Vatican Museums & Sistine Chapel',
    duration: '3.5 hours',
    price: 85,
    category: 'Culture',
    imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'a-ita-4',
    name: 'Pizza Making Masterclass',
    duration: '2.5 hours',
    price: 75,
    category: 'Dining',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'a-ita-5',
    name: 'Borghese Gallery Tour',
    duration: '2 hours',
    price: 45,
    category: 'Culture',
    imageUrl: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/08/ef/22.jpg'
  },
  {
    id: 'a-ita-6',
    name: 'Trastevere Food Walking Tour',
    duration: '4 hours',
    price: 90,
    category: 'Food',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'a-ita-7',
    name: 'Pompeii Day Trip from Rome',
    duration: '12 hours',
    price: 150,
    category: 'Excursion',
    imageUrl: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/3e/7a.jpg'
  },
  {
    id: 'a-ita-8',
    name: 'Rome Twilight Cycling Tour',
    duration: '3 hours',
    price: 60,
    category: 'Leisure',
    imageUrl: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/16/ac/08/a3.jpg'
  }
];

export const ALTERNATIVE_HOTELS: Hotel[] = [
  {
    id: 'h-alt-1',
    name: 'The Shard Shangri-La',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 890,
    description: 'Iconic views from floors 34-52 of The Shard with floor-to-ceiling windows and skyline panoramas.',
    amenities: ['Club Lounge', 'Spa', 'City View', 'Pool', 'Fine Dining'],
    address: '31 St Thomas St, London SE1 9QU',
    isVerified: true
  },
  {
    id: 'h-alt-2',
    name: 'The Savoy',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 780,
    description: 'A legendary Edwardian hotel on the Strand, renowned for its timeless elegance and Thames views.',
    amenities: ['Pool', 'Bar', 'Spa', 'Afternoon Tea', 'River View'],
    address: 'Strand, London WC2R 0EZ',
    isVerified: true
  },
  {
    id: 'h-alt-3',
    name: "Claridge's",
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 950,
    description: 'Art Deco masterpiece in the heart of Mayfair, the epitome of understated British luxury.',
    amenities: ['Butler Service', 'Spa', 'Fumoir Bar', 'Anya'],
    address: 'Brook St, London W1K 4HR',
    isVerified: true
  },
  {
    id: 'h-alt-4',
    name: 'The Connaught',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1050,
    description: 'A quintessentially English retreat in Mayfair with two-Michelin-star dining by Hélène Darroze.',
    amenities: ['Michelin Dining', 'Spa', 'Garden', 'Cocktail Bar'],
    address: 'Carlos Pl, London W1K 2AL',
    isVerified: true
  },
  {
    id: 'h-alt-5',
    name: 'Rosewood London',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 720,
    description: 'Beautifully restored Edwardian building in High Holborn with a stunning inner courtyard.',
    amenities: ['Holborn Dining Room', 'Sense Spa', 'Gym', 'Courtyard'],
    address: '252 High Holborn, London WC1V 7EN',
    isVerified: true
  },
  {
    id: 'h-alt-6',
    name: 'Corinthia London',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 850,
    description: 'A grand Victorian-era hotel steps from Whitehall, featuring the renowned ESPA Life spa.',
    amenities: ['ESPA Life Spa', 'Pool', 'Rooftop Penthouse', 'Garden Lounge'],
    address: 'Whitehall Pl, London SW1A 2BD',
    isVerified: true
  },
  {
    id: 'h-alt-7',
    name: 'The Lanesborough',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 1200,
    description: 'Overlooking Hyde Park Corner, a Regency-style palace with personal butler for every guest.',
    amenities: ['24hr Butler', 'Spa', 'Library Bar', 'Céleste Restaurant'],
    address: 'Hyde Park Corner, London SW1X 7TA',
    isVerified: true
  },
  {
    id: 'h-alt-8',
    name: 'Mandarin Oriental Hyde Park',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 680,
    description: 'Knightsbridge landmark with views over Hyde Park and two-Michelin-star Dinner by Heston.',
    amenities: ['Dinner by Heston', 'Spa', 'Park View', 'Fitness'],
    address: '66 Knightsbridge, London SW1X 7LA'
  },
  {
    id: 'h-alt-9',
    name: 'The Berkeley',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800',
    pricePerNight: 620,
    description: 'A fashionable Knightsbridge hotel with a rooftop pool and the famous Prêt-à-Portea tea.',
    amenities: ['Rooftop Pool', 'Blue Bar', 'Marcus Restaurant', 'Spa'],
    address: 'Wilton Pl, London SW1X 7RL'
  }
];

const getLogo = (code: string) => `https://pics.avs.io/200/200/${code}.png`;

export const FLIGHTS_TO_ITALY: Flight[] = [
  { id: 'EK-493', airline: 'Emirates', airlineLogo: getLogo('EK'), departureTime: '01:30 PM', arrivalTime: '03:45 PM', price: 2800, duration: '2h 15m', originIata: 'DXB', destinationIata: 'FCO', isVerified: true },
  { id: 'EY-301', airline: 'Etihad Airways', airlineLogo: getLogo('EY'), departureTime: '07:45 AM', arrivalTime: '10:00 AM', price: 3200, duration: '2h 15m', originIata: 'AUH', destinationIata: 'FCO', isVerified: true },
  { id: 'FZ-1431', airline: 'flydubai', airlineLogo: getLogo('FZ'), departureTime: '06:20 AM', arrivalTime: '08:40 AM', price: 1400, duration: '2h 20m', originIata: 'DXB', destinationIata: 'FCO' },
  { id: 'QR-4022', airline: 'Qatar Airways', airlineLogo: getLogo('QR'), departureTime: '10:45 AM', arrivalTime: '01:05 PM', price: 1600, duration: '2h 20m', originIata: 'DOH', destinationIata: 'CIA' },
  { id: 'EK-1349', airline: 'Emirates', airlineLogo: getLogo('EK'), departureTime: '06:10 AM', arrivalTime: '10:45 AM', price: 2200, duration: '4h 35m', originIata: 'DXB', destinationIata: 'FCO' },
  { id: 'EY-1342', airline: 'Etihad Airways', airlineLogo: getLogo('EY'), departureTime: '02:15 PM', arrivalTime: '06:55 PM', price: 2100, duration: '4h 40m', originIata: 'AUH', destinationIata: 'FCO' },
  { id: 'QR-623', airline: 'Qatar Airways', airlineLogo: getLogo('QR'), departureTime: '08:30 AM', arrivalTime: '12:20 PM', price: 1850, duration: '3h 50m', originIata: 'DOH', destinationIata: 'FCO' },
  { id: 'EK-1348', airline: 'Emirates', airlineLogo: getLogo('EK'), departureTime: '11:50 AM', arrivalTime: '04:40 PM', price: 2450, duration: '4h 50m', originIata: 'DXB', destinationIata: 'FCO' }
];

export const FLIGHTS_TO_PARIS: Flight[] = [
  { id: 'EK-1347', airline: 'Emirates', airlineLogo: getLogo('EK'), departureTime: '06:20 AM', arrivalTime: '09:00 AM', price: 4200, duration: '2h 40m', originIata: 'DXB', destinationIata: 'CDG' },
  { id: 'EY-331', airline: 'Etihad Airways', airlineLogo: getLogo('EY'), departureTime: '04:30 PM', arrivalTime: '07:15 PM', price: 3800, duration: '2h 45m', originIata: 'AUH', destinationIata: 'CDG' },
  { id: 'QR-1615', airline: 'Qatar Airways', airlineLogo: getLogo('QR'), departureTime: '10:15 AM', arrivalTime: '01:50 PM', price: 3100, duration: '3h 35m', originIata: 'DOH', destinationIata: 'CDG' },
  { id: 'EK-401', airline: 'Emirates', airlineLogo: getLogo('EK'), departureTime: '08:00 AM', arrivalTime: '11:45 AM', price: 2900, duration: '3h 45m', originIata: 'DXB', destinationIata: 'CDG' },
  { id: 'EY-610', airline: 'Etihad Airways', airlineLogo: getLogo('EY'), departureTime: '12:30 PM', arrivalTime: '04:25 PM', price: 3400, duration: '3h 55m', originIata: 'AUH', destinationIata: 'CDG' },
  { id: 'QR-876', airline: 'Qatar Airways', airlineLogo: getLogo('QR'), departureTime: '07:15 AM', arrivalTime: '11:30 AM', price: 4500, duration: '4h 15m', originIata: 'DOH', destinationIata: 'CDG' },
  { id: 'EK-1362', airline: 'Emirates', airlineLogo: getLogo('EK'), departureTime: '02:00 PM', arrivalTime: '06:10 PM', price: 3950, duration: '4h 10m', originIata: 'DXB', destinationIata: 'CDG' },
  { id: 'EY-367', airline: 'Etihad Airways', airlineLogo: getLogo('EY'), departureTime: '09:45 AM', arrivalTime: '01:40 PM', price: 3250, duration: '3h 55m', originIata: 'AUH', destinationIata: 'CDG' },
  { id: 'QR-623', airline: 'Qatar Airways', airlineLogo: getLogo('QR'), departureTime: '06:00 PM', arrivalTime: '10:15 PM', price: 2850, duration: '4h 15m', originIata: 'DOH', destinationIata: 'CDG' }
];

export const FLIGHTS_TO_ABU_DHABI: Flight[] = [
  { id: 'EK-494', airline: 'Emirates', airlineLogo: getLogo('EK'), departureTime: '05:10 PM', arrivalTime: '07:15 PM', price: 2900, duration: '2h 05m', originIata: 'DXB', destinationIata: 'AUH' },
  { id: 'EY-302', airline: 'Etihad Airways', airlineLogo: getLogo('EY'), departureTime: '11:40 AM', arrivalTime: '01:55 PM', price: 3400, duration: '2h 15m', originIata: 'DXB', destinationIata: 'AUH' },
  { id: 'FZ-1432', airline: 'flydubai', airlineLogo: getLogo('FZ'), departureTime: '09:45 AM', arrivalTime: '12:00 PM', price: 1500, duration: '2h 15m', originIata: 'DXB', destinationIata: 'AUH' }
];

export const PARIS_ACTIVITIES: Activity[] = [
  { id: 'a1-par', name: 'Louvre Museum Private Tour', duration: '3 hours', price: 950, category: 'Culture', imageUrl: 'https://images.unsplash.com/photo-1567942585146-33d62b775db0?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bG91dnJlJTIwbXVzZXVtfGVufDB8fDB8fHww', isPopular: true, isMostVisited: true },
  { id: 'a2-par', name: 'Eiffel Tower Gourmet Lunch', duration: '2 hours', price: 1500, category: 'Dining', imageUrl: 'https://images.unsplash.com/photo-1566331551467-0dc72cc80ec0?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFyaXMlMjBmb29kfGVufDB8fDB8fHww' },
  { id: 'a3-par', name: 'Seine River Evening Cruise', duration: '1.5 hours', price: 600, category: 'Leisure', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=400' },
  { id: 'a4-par', name: 'Montmartre Artists Walk', duration: '2 hours', price: 450, category: 'Culture', imageUrl: 'https://memories-france.travel/wp-content/uploads/2023/03/13_Montmartre-Artists-Quarter-Tour-3.jpg' }
];

export const ABU_DHABI_ACTIVITIES: Activity[] = [
  { id: 'a1-auh', name: 'Sheikh Zayed Grand Mosque Tour', duration: '4 hours', price: 800, category: 'Sightseeing', imageUrl: 'https://images.unsplash.com/photo-1544161442-e3db36c4f67c?auto=format&fit=crop&q=80&w=400' },
  { id: 'a2-auh', name: 'Ferrari World Adventure', duration: '3 hours', price: 1200, category: 'Adventure', imageUrl: 'https://images.unsplash.com/photo-1511210352396-54a44b50c90c?auto=format&fit=crop&q=80&w=400' },
  { id: 'a3-auh', name: 'Louver Abu Dhabi Exploration', duration: '5 hours', price: 950, category: 'Culture', imageUrl: 'https://images.unsplash.com/photo-1614589057371-6ae4a85fa0f4?auto=format&fit=crop&q=80&w=400' },
  { id: 'a4-auh', name: 'Desert Safari Expedition', duration: '2 hours', price: 600, category: 'Culture', imageUrl: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&q=80&w=400' }
];

export const TOKYO_ACTIVITIES: Activity[] = [
  { id: 'ta1', name: 'Shibuya Food Tour', duration: '4 hours', price: 950, category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400' }
];

const createMockDest = (id: string, name: string, country: string, imageUrl: string, description: string): Destination => ({
  id, name, country, imageUrl, description,
  flights: name === 'Italy' ? FLIGHTS_TO_ITALY : (name === 'Paris' ? FLIGHTS_TO_PARIS : FLIGHTS_TO_ABU_DHABI),
  hotels: name === 'Italy' ? ITALY_HOTELS : (name === 'Paris' ? PARIS_HOTELS : ALTERNATIVE_HOTELS),
  activities: name === 'Italy' ? ITALY_ACTIVITIES : (name === 'Paris' ? PARIS_ACTIVITIES : (name === 'Abu Dhabi' ? ABU_DHABI_ACTIVITIES : TOKYO_ACTIVITIES))
});

export const ESSENTIALS_CATALOG: Essential[] = [
  {
    id: 'e1',
    category: 'Transport',
    title: 'Airport Transfer',
    price: 450,
    icon: 'Car',
    description: 'Private chauffeur',
    variants: [
      { id: 'v1a', title: 'Standard Sedan', price: 450, description: 'Private chauffeur' },
      { id: 'v1b', title: 'Luxury SUV', price: 850, description: 'Black Car Service' },
      { id: 'v1c', title: 'Tesla Model X', price: 1100, description: 'Elite Electric' }
    ]
  },
  {
    id: 'e2',
    category: 'Connectivity',
    title: 'Travel eSIM',
    price: 150,
    icon: 'Wifi',
    description: 'Unlimited 5G Data',
    variants: [
      { id: 'v2a', title: 'Basic 5GB', price: 150, description: 'Unlimited 5G Data' },
      { id: 'v2b', title: 'Pro 20GB', price: 350, description: 'High Speed Priority' },
      { id: 'v2c', title: 'Ultimate Unlimited', price: 600, description: 'Global Roaming Plus' }
    ]
  },
  {
    id: 'e3',
    category: 'Protection',
    title: 'Insurance',
    price: 300,
    icon: 'Shield',
    description: 'Premium Coverage',
    variants: [
      { id: 'v3a', title: 'Basic Medical', price: 300, description: 'Standard Protection' },
      { id: 'v3b', title: 'Silver Coverage', price: 550, description: 'Theft & Cancellation' },
      { id: 'v3c', title: 'Platinum Elite', price: 900, description: 'No-Deductible Full' }
    ]
  },
  {
    id: 'e4',
    category: 'Leisure',
    title: 'Lounge Access',
    price: 550,
    icon: 'Coffee',
    description: 'VIP Airport Comfort',
    variants: [
      { id: 'v4a', title: 'Marhaba Lounge', price: 550, description: 'Standard VIP Access' },
      { id: 'v4b', title: 'Emirates Business', price: 1200, description: 'Premier Lounge Entry' },
      { id: 'v4c', title: 'First Class Lounge', price: 2500, description: 'Ultimate Luxury' }
    ]
  },
  {
    id: 'e5',
    category: 'Assistance',
    title: 'Anya',
    price: 800,
    icon: 'User',
    description: '24/7 Personal Asst'
  },
  {
    id: 'e6',
    category: 'Priority',
    title: 'Fast Track',
    price: 250,
    icon: 'Zap',
    description: 'Skip Airport Lines'
  },
  {
    id: 'e7',
    category: 'Access',
    title: 'City Pass',
    price: 650,
    icon: 'Ticket',
    description: 'All Museums Entry'
  }
];

export const ESSENTIALS: Essential[] = ESSENTIALS_CATALOG.slice(0, 3);

export const DESTINATIONS: Destination[] = [
  createMockDest('abu-dhabi-01', 'Abu Dhabi', 'UAE', 'https://images.unsplash.com/photo-1544161442-e3db36c4f67c?auto=format&fit=crop&q=80&w=1000', 'The capital of the UAE, where modern architecture meets rich cultural heritage.'),
  createMockDest('paris-01', 'Paris', 'France', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'The City of Light draws millions of visitors every year with its unforgettable ambiance.'),
  {
    id: 'tokyo-01',
    name: 'Tokyo',
    country: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000',
    description: 'A futuristic metropolis where neon skyscrapers meet historic temples.',
    flights: [
      { id: 'EK-318', airline: 'Emirates', airlineLogo: getLogo('EK'), departureTime: '08:00 AM', arrivalTime: '11:00 PM', price: 14500, duration: '13h 00m', originIata: 'DXB', destinationIata: 'NRT' },
      { id: 'EY-201', airline: 'Etihad Airways', airlineLogo: getLogo('EY'), departureTime: '11:30 PM', arrivalTime: '02:45 PM', price: 13200, duration: '13h 15m', originIata: 'AUH', destinationIata: 'NRT' }
    ],
    hotels: ALTERNATIVE_HOTELS,
    activities: [
      { id: 'ta1', name: 'Shibuya Food Tour', duration: '4 hours', price: 950, category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400' }
    ]
  }
];

export const MOCK_BOOKED_CURATION: Curation = {
  curationId: 'MC-A1B2C3',
  tripName: 'London Business & Weekend',
  origin: 'Dubai',
  destination: {
    ...DESTINATIONS[1],
    name: 'London',
    country: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1000'
  } as any,
  itinerary: [],
  travelers: 1,
  status: 'fully_booked',
  startDate: '2026-11-04',
  endDate: '2026-11-10',
  flightBooking: {
    flightId: 'EK-281',
    bookingRef: 'DXBLON2024',
    price: 12000,
    airline: 'Emirates',
    billingType: 'business'
  },
  hotelBooking: {
    hotelId: 'h-lon-1',
    bookingRef: 'STAY-LON-99',
    totalPrice: 45000,
    hotelName: 'The Shard Shangri-La',
    billingType: 'business'
  },
  essentialsBooking: {
    items: [
      { id: 'mus-1', title: 'West End: Lion King', price: 4500, category: 'Leisure', icon: 'Ticket', description: 'Premium Seating' } as any
    ],
    totalPrice: 4500,
    bookingRef: 'LEI-LON-01',
    billingType: 'personal'
  }
};
