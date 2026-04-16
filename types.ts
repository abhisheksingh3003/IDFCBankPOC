export type BookingCategory = 'hotels' | 'flights' | 'experiences' | 'others' | 'itinerary' | 'concierge';

export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration: string;
  originIata?: string;
  destinationIata?: string;
  flightNumber?: string;
  date?: string;
  isVerified?: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  imageUrl: string;
  pricePerNight: number;
  description: string;
  amenities?: string[];
  address?: string;
  isVerified?: boolean;
}

export interface Activity {
  id: string;
  name: string;
  duration: string;
  price: number;
  category: string;
  imageUrl: string;
  isPopular?: boolean;
  isMostVisited?: boolean;
}

// Added optional variants to Essential interface to support detailed service options
export interface Essential {
  id: string;
  category: string;
  title: string;
  price: number;
  icon: string;
  description: string;
  variants?: {
    id: string;
    title: string;
    price: number;
    description: string;
  }[];
  quantity?: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  description: string;
  flights: Flight[];
  hotels: Hotel[];
  activities: Activity[];
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'pl';
export type View = 'landing' | 'builder' | 'manual-planner' | 'manual-dashboard' | 'results' | 'my-curations' | 'booking' | 'my-bookings' | 'bundle-booking' | 'experience-booking' | 'flight-booking' | 'onboarding';
export type PlannerMode = 'ai' | 'manual';

export interface AIItinerary {
  day: number;
  title: string;
  events: {
    time: string;
    description: string;
    consensus?: string[];
  }[];
}

export interface ExperienceBooking {
  activityId: string;
  bookingRef: string;
  date: string;
  time: string;
  price: number;
  activityName: string;
  quantity: number;
  imageUrl: string;
}

export interface Curation {
  curationId: string;
  origin?: string;
  destination: Destination;
  itinerary: AIItinerary[];
  travelers: number;
  status: 'draft' | 'partially_booked' | 'fully_booked';
  startDate?: string;
  endDate?: string;
  tripName?: string;
  isManual?: boolean; // New flag for visibility logic
  hotelBooking?: {
    hotelId: string;
    bookingRef: string;
    totalPrice: number;
    hotelName?: string;
    imageUrl?: string;
    roomType?: string;
    billingType?: 'business' | 'personal';
  };
  flightBooking?: {
    flightId: string;
    bookingRef: string;
    price: number;
    airline?: string;
    airlineLogo?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    travelClass?: string;
    originIata?: string;
    destinationIata?: string;
    billingType?: 'business' | 'personal';
  };
  essentialsBooking?: {
    items: Essential[];
    totalPrice: number;
    bookingRef: string;
    billingType?: 'business' | 'personal';
  };
  experienceBookings?: ExperienceBooking[];
  familyMembers?: FamilyMember[];
  preTripChecklist?: PreTripChecklistItem[];
  activityBookings?: {
    id: string;
    bookingRef: string;
    date: string;
    time: string;
    price: number;
    name: string;
    quantity: number;
  }[];
}

export type BookingStep = 'details' | 'search' | 'rooms' | 'guests' | 'review' | 'payment' | 'success';

// Dedicated Manual Planner State
export interface ManualTripContextState {
  // Phase 1: Initialization
  tripName: string;
  source: string;
  destination: string;
  fromDate: string;
  toDate: string;
  travelers: {
    adults: number;
    children: number;
  };
  preferences: {
    airline: string;
    airlineLoyaltyId?: string;
    hotelChain: string;
    hotelLoyaltyId?: string;
    carRental: string;
  };
  familyMembers?: FamilyMember[];
  notes: string;

  // Phase 2: Selections
  selectedFlight: Flight | null;
  selectedHotel: Hotel | null;
  selectedRoomType: string | null;
  selectedActivities: ExperienceBooking[];
  selectedEssentials: Essential[];
}

export type ManualBuildingStage = 'flights' | 'hotels' | 'experiences' | 'essentials' | 'summary';

export type FamilyVibe = 'Beach' | 'Mountains' | 'Culture' | 'Adventure' | 'Relax' | 'Foodie';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  vibe: FamilyVibe;
  avatar?: string;
}

export interface PreTripChecklistItem {
  id: string;
  task: string;
  description?: string;
  isCompleted: boolean;
  category: 'Documents' | 'Gear' | 'Services' | 'Health';
  recommendation?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  mobilityNeeds: string[]; // e.g. ["wheelchair_access", "limited_walking", "braille_support"]
  dietaryRestrictions: string[]; // e.g. ["vegan", "nut_free", "halal"]
  pacePreference: 'relaxed' | 'balanced' | 'explorer';
  budgetStyle: 'budget' | 'standard' | 'luxury';
  loyaltyPrograms: { provider: string; id: string }[];
  examSchedules?: { date: string; subject: string }[]; // Specific constraint for students
  flexibleCancellation: boolean;
  isOnboarded: boolean;
}