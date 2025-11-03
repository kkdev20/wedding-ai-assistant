'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  DollarSign, 
  Star, 
  Phone, 
  Globe, 
  Calendar,
  Heart,
  Share2,
  Clock,
  Car,
  Utensils,
  Music,
  Camera
} from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  price: number;
  rating: number;
  phone: string;
  website: string;
  images: string[];
  amenities: string[];
  events: string[];
}

// Mock data - replace with actual API call
const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Grand Ballroom Jakarta',
    description: 'Elegant ballroom dengan kapasitas besar, cocok untuk pernikahan mewah dan acara spesial. Dilengkapi dengan teknologi sound system modern dan dekorasi yang memukau.',
    location: 'Jl. Sudirman No. 123, Jakarta Selatan',
    capacity: 500,
    price: 150000000,
    rating: 4.8,
    phone: '+62 21 1234 5678',
    website: 'https://grandballroom.com',
    images: [
      '/api/placeholder/800/400',
      '/api/placeholder/800/400',
      '/api/placeholder/800/400',
      '/api/placeholder/800/400'
    ],
    amenities: ['AC', 'Parkir Luas', 'Catering', 'Dekorasi', 'Sound System', 'Lighting'],
    events: ['Pernikahan', 'Tunangan', 'Ulang Tahun', 'Gathering Perusahaan']
  },
  {
    id: '2',
    name: 'Garden Palace Resort',
    description: 'Venue outdoor dengan taman tropis yang indah, perfect untuk pernikahan alam dan acara romantis.',
    location: 'Jl. Gatot Subroto No. 45, Jakarta Pusat',
    capacity: 300,
    price: 120000000,
    rating: 4.6,
    phone: '+62 21 8765 4321',
    website: 'https://gardenpalace.com',
    images: [
      '/api/placeholder/800/400',
      '/api/placeholder/800/400',
      '/api/placeholder/800/400'
    ],
    amenities: ['Taman', 'Kolam Renang', 'Mushola', 'Ruang Ganti', 'Generator Cadangan'],
    events: ['Pernikahan', 'Foto Prewedding', 'Lamaran', 'Anniversary']
  }
];

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchVenue = async () => {
      setLoading(true);
      try {
        const foundVenue = mockVenues.find(v => v.id === params.id);
        if (foundVenue) {
          setVenue(foundVenue);
        }
      } catch (error) {
        console.error('Error fetching venue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [params.id]);

  const handleBookNow = () => {
    // Navigate to booking page or open booking modal
    alert('Fitur booking akan segera tersedia!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue?.name,
          text: venue?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Memuat detail venue...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Venue Tidak Ditemukan</h1>
          <Link 
            href="/venues"
            className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Venue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                Detail Venue
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'bg-red-50 text-red-500 dark:bg-red-900/20' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-96 rounded-2xl overflow-hidden mb-4">
            <Image
              src={venue.images[selectedImage]}
              alt={venue.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {venue.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-20 rounded-lg overflow-hidden transition-all ${
                  selectedImage === index ? 'ring-2 ring-pink-500' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={image}
                  alt={`${venue.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Venue Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {venue.name}
                </h1>
                <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    {venue.rating}
                  </span>
                </div>
              </div>

              <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{venue.location}</span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {venue.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Fasilitas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {venue.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
                  >
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Events */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Tipe Acara yang Cocok
              </h2>
              <div className="flex flex-wrap gap-2">
                {venue.events.map((event, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded-full text-sm"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatPrice(venue.price)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/event</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Users className="w-5 h-5 mr-3" />
                    <span>Kapasitas: {venue.capacity} orang</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock className="w-5 h-5 mr-3" />
                    <span>Full day (10 jam)</span>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Pesan Sekarang
                </button>

                <div className="flex space-x-3">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>Telepon</span>
                  </button>
                  
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                Informasi Cepat
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Car className="w-5 h-5 mr-3" />
                  <span className="text-sm">Parkir tersedia untuk 200+ mobil</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Utensils className="w-5 h-5 mr-3" />
                  <span className="text-sm">Catering halal tersedia</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Music className="w-5 h-5 mr-3" />
                  <span className="text-sm">Sound system profesional</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Camera className="w-5 h-5 mr-3" />
                  <span className="text-sm">Area foto indoor & outdoor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}