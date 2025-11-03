// app/venues/page.tsx - COMPLETE WITH IMAGES
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, MapPin, Users, DollarSign, Sun, Moon } from 'lucide-react';
import { type Language, useTranslations } from '@/lib/translations';
import LanguageToggle from '@/components/LanguageToggle';

interface Venue {
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

const venuesData: Venue[] = [
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

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'guests'>('name');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const t = useTranslations(language);

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem('darkMode');
    const savedLang = localStorage.getItem('language') as Language;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else {
      setDarkMode(systemPrefersDark);
    }
    
    if (savedLang === 'en' || savedLang === 'id') {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('language', language);
  }, [language, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  const filteredVenues = useMemo(() => {
    return venuesData
      .filter(venue => {
        const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           venue.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || venue.type === selectedType;
        const matchesPrice = venue.price >= priceRange[0] && venue.price <= priceRange[1];
        
        return matchesSearch && matchesType && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'guests') {
          const aMax = parseInt(a.guests.split('-')[1]);
          const bMax = parseInt(b.guests.split('-')[1]);
          return aMax - bMax;
        }
        return a.name.localeCompare(b.name);
      });
  }, [searchTerm, selectedType, priceRange, sortBy]);

  const venueTypes = ['all', 'beach', 'villa', 'resort'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2">
                <LanguageToggle language={language} onToggle={toggleLanguage} />
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 border border-gray-200 dark:border-gray-600"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {t.venues.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t.venues.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.venues.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Venue Type Filter */}
            <div className="flex gap-2 flex-wrap">
              {venueTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    selectedType === type
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {type === 'all' ? t.venues.allTypes : type === 'beach' ? t.planner.beach : type === 'villa' ? t.planner.villa : t.planner.resort}
                </button>
              ))}
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="name">{t.common.search}</option>
              <option value="price">{t.common.budget}</option>
              <option value="guests">{t.common.guests}</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.venues.priceRange}:</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
              <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {filteredVenues.length} {t.common.venues} {t.common.search}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span>{t.venues.filterByType}</span>
          </div>
        </div>

        {/* Venue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map(venue => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={venue.images[0]}
                  alt={venue.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-rose-500 text-white text-xs rounded-full capitalize">
                      {venue.type}
                    </span>
                    {venue.virtualTour && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        360° Tour
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {venue.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {venue.description}
                </p>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{venue.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{venue.guests} {t.venues.guests}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-rose-500" />
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      ${venue.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Amenities Preview */}
                <div className="mt-4 flex gap-1 flex-wrap">
                  {venue.amenities.slice(0, 3).map(amenity => (
                    <span
                      key={amenity}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                  {venue.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                      +{venue.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🏝️</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {t.venues.noResults}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {t.common.tryAgain}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}