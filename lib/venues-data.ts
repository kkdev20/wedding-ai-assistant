// lib/venues-data.ts (di root folder)
export interface Venue {
  id: string;
  name: string;
  type: 'beach' | 'villa' | 'resort';
  location: string;
  price: number;
  guests: string;
  description: string;
  images: string[];
  amenities: string[];
  virtualTour?: string;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const venuesData: Venue[] = [
  {
    id: 'jimbaran-bay-beach',
    name: 'Jimbaran Bay Beach Club',
    type: 'beach',
    location: 'Jimbaran, South Bali',
    price: 3000,
    guests: '50-100',
    description: 'Stunning sunset beach venue with golden hour ceremonies and direct beach access. Perfect for romantic sunset weddings.',
    images: [
      '/images/venues/jimbaran-1.jpg',
      '/images/venues/jimbaran-2.jpg', 
      '/images/venues/jimbaran-3.jpg'
    ],
    amenities: [
      'Beachfront ceremony',
      'Sunset viewing',
      'Sound system',
      'Bridal suite',
      'Parking',
      'Catering kitchen'
    ],
    virtualTour: 'https://example.com/virtual-tour/jimbaran',
    contact: {
      phone: '+62 361 123 456',
      email: 'info@jimbaranbay.com',
      website: 'https://jimbaranbay.com'
    },
    coordinates: {
      lat: -8.7896,
      lng: 115.1619
    }
  },
  {
    id: 'ayana-resort',
    name: 'Ayana Resort Bali',
    type: 'resort',
    location: 'Jimbaran, South Bali',
    price: 8000,
    guests: '100-200',
    description: 'World-class luxury resort with multiple wedding venues including cliffside, beachfront, and garden options.',
    images: [
      '/images/venues/ayana-1.jpg',
      '/images/venues/ayana-2.jpg',
      '/images/venues/ayana-3.jpg'
    ],
    amenities: [
      'Multiple venue options',
      'Luxury accommodations',
      'Spa services',
      'Fine dining',
      'Pool access',
      'Event planning'
    ],
    virtualTour: 'https://example.com/virtual-tour/ayana',
    contact: {
      phone: '+62 361 702 222',
      email: 'weddings@ayana.com',
      website: 'https://ayana.com'
    },
    coordinates: {
      lat: -8.7797,
      lng: 115.1651
    }
  },
  {
    id: 'ubud-private-villa',
    name: 'Ubud Private Estate',
    type: 'villa',
    location: 'Ubud, Central Bali',
    price: 2500,
    guests: '20-50',
    description: 'Secluded jungle villa with infinity pool, traditional architecture, and complete privacy for intimate weddings.',
    images: [
      '/images/venues/ubud-1.jpg',
      '/images/venues/ubud-2.jpg',
      '/images/venues/ubud-3.jpg'
    ],
    amenities: [
      'Private pool',
      'Jungle views',
      'Full staff',
      'Traditional architecture',
      'Privacy guaranteed',
      'Catering options'
    ],
    contact: {
      phone: '+62 361 987 654',
      email: 'events@ubudvilla.com',
      website: 'https://ubudprivatevilla.com'
    },
    coordinates: {
      lat: -8.5193,
      lng: 115.2633
    }
  },
  {
    id: 'nusa-dua-beach',
    name: 'Nusa Dua Beach Hotel',
    type: 'beach',
    location: 'Nusa Dua, South Bali',
    price: 5000,
    guests: '80-150',
    description: 'Luxury beachfront hotel with pristine white sand beach and comprehensive wedding packages.',
    images: [
      '/images/venues/nusa-dua-1.jpg',
      '/images/venues/nusa-dua-2.jpg',
      '/images/venues/nusa-dua-3.jpg'
    ],
    amenities: [
      'White sand beach',
      'Luxury amenities',
      'Water sports',
      'Multiple restaurants',
      'Spa services',
      'Ballroom option'
    ],
    contact: {
      phone: '+62 361 771 210',
      email: 'weddings@nusaduahotel.com',
      website: 'https://nusaduabeachhotel.com'
    },
    coordinates: {
      lat: -8.7936,
      lng: 115.2175
    }
  },
  {
    id: 'seminyak-luxury-villa',
    name: 'Seminyak Luxury Villa',
    type: 'villa',
    location: 'Seminyak, South Bali',
    price: 3500,
    guests: '30-70',
    description: 'Modern luxury villa in the heart of Seminyak with contemporary design and premium amenities.',
    images: [
      '/images/venues/seminyak-1.jpg',
      '/images/venues/seminyak-2.jpg',
      '/images/venues/seminyak-3.jpg'
    ],
    amenities: [
      'Modern design',
      'Central location',
      'Rooftop terrace',
      'Smart home features',
      'Chef kitchen',
      'Guest accommodations'
    ],
    contact: {
      phone: '+62 361 734 567',
      email: 'bookings@seminyakvilla.com',
      website: 'https://seminyakluxuryvilla.com'
    },
    coordinates: {
      lat: -8.6905,
      lng: 115.1642
    }
  },
  {
    id: 'uluwatu-cliffside',
    name: 'Uluwatu Cliff Resort',
    type: 'resort',
    location: 'Uluwatu, South Bali',
    price: 6000,
    guests: '40-100',
    description: 'Dramatic cliffside venue with panoramic ocean views and contemporary Balinese architecture.',
    images: [
      '/images/venues/uluwatu-1.jpg',
      '/images/venues/uluwatu-2.jpg',
      '/images/venues/uluwatu-3.jpg'
    ],
    amenities: [
      'Cliffside views',
      'Infinity pool',
      'Ocean access',
      'Luxury suites',
      'Wedding chapel',
      'Helipad'
    ],
    virtualTour: 'https://example.com/virtual-tour/uluwatu',
    contact: {
      phone: '+62 361 895 432',
      email: 'events@uluwaturesort.com',
      website: 'https://uluwatucliffresort.com'
    },
    coordinates: {
      lat: -8.8274,
      lng: 115.0869
    }
  }
];