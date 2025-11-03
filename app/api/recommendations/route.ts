// app/api/recommendations/route.ts - AI-Powered Recommendations API
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { venuesData, type Venue } from '@/lib/venues-data';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

type Language = 'en' | 'id';

// Initialize OpenAI client (with fallback if no API key)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Smart venue matching algorithm (rule-based fallback)
function getSmartVenueMatches(
  guestCount: number,
  budget: number,
  venueType: string,
  season: string,
  venues: Venue[]
): Venue[] {
  // Filter by type
  let filtered = venues.filter(v => v.type === venueType);
  
  // Parse guest range and filter
  filtered = filtered.filter(v => {
    const [min, max] = v.guests.split('-').map(n => parseInt(n.trim()));
    return guestCount >= min && guestCount <= max;
  });
  
  // Filter by budget (venue should be within 30-50% of total budget)
  const venueBudgetRange = {
    min: budget * 0.3,
    max: budget * 0.5
  };
  filtered = filtered.filter(v => v.price >= venueBudgetRange.min && v.price <= venueBudgetRange.max);
  
  // Sort by relevance score
  filtered.sort((a, b) => {
    // Prefer venues closer to guest count
    const aGuestMid = (parseInt(a.guests.split('-')[0]) + parseInt(a.guests.split('-')[1])) / 2;
    const bGuestMid = (parseInt(b.guests.split('-')[0]) + parseInt(b.guests.split('-')[1])) / 2;
    const aGuestDiff = Math.abs(aGuestMid - guestCount);
    const bGuestDiff = Math.abs(bGuestMid - guestCount);
    
    // Prefer venues closer to budget center
    const budgetCenter = (venueBudgetRange.min + venueBudgetRange.max) / 2;
    const aBudgetDiff = Math.abs(a.price - budgetCenter);
    const bBudgetDiff = Math.abs(b.price - budgetCenter);
    
    // Combined score (lower is better)
    const aScore = aGuestDiff * 0.6 + (aBudgetDiff / 1000) * 0.4;
    const bScore = bGuestDiff * 0.6 + (bBudgetDiff / 1000) * 0.4;
    
    return aScore - bScore;
  });
  
  // Return top 6 matches
  return filtered.slice(0, 6);
}

// Generate AI-powered recommendations using OpenAI
async function getAIRecommendations(
  guestCount: number,
  budget: number,
  venueType: string,
  season: string,
  lang: Language
): Promise<{
  venues: Array<{name: string; reason: string; matchScore: number}>;
  budgetTips: string;
  vendorSuggestions: string[];
  timelineAdvice: string;
} | null> {
  if (!openai || !process.env.OPENAI_API_KEY) {
    return null;
  }
  
  try {
    const isId = lang === 'id';
    const venueTypeText = isId 
      ? (venueType === 'beach' ? 'pantai' : venueType === 'villa' ? 'villa' : 'resor')
      : venueType;
    const seasonText = isId
      ? (season === 'april-october' ? 'musim kemarau' : 'musim hujan')
      : (season === 'april-october' ? 'dry season' : 'wet season');
    
    const prompt = isId
      ? `Saya merencanakan pernikahan di Bali dengan:
- ${guestCount} tamu
- Budget: $${budget.toLocaleString()}
- Tipe venue: ${venueTypeText}
- Musim: ${seasonText}

Beri saya:
1. 3-5 rekomendasi venue spesifik di Bali dengan alasan mengapa cocok
2. Tips optimasi budget untuk budget $${budget.toLocaleString()}
3. 3-5 rekomendasi vendor (fotografer, katering, dll) yang cocok
4. Saran timeline untuk pernikahan di ${seasonText}

Jawab dalam format JSON dengan struktur:
{
  "venues": [{"name": "Nama Venue", "reason": "Alasan", "matchScore": 95}],
  "budgetTips": "Tips budget",
  "vendorSuggestions": ["Vendor 1", "Vendor 2"],
  "timelineAdvice": "Saran timeline"
}`
      : `I'm planning a wedding in Bali with:
- ${guestCount} guests
- Budget: $${budget.toLocaleString()}
- Venue type: ${venueTypeText}
- Season: ${seasonText}

Please provide:
1. 3-5 specific venue recommendations in Bali with reasons why they fit
2. Budget optimization tips for $${budget.toLocaleString()} budget
3. 3-5 vendor recommendations (photographers, catering, etc.) that fit
4. Timeline advice for ${seasonText} wedding

Answer in JSON format with structure:
{
  "venues": [{"name": "Venue Name", "reason": "Reason", "matchScore": 95}],
  "budgetTips": "Budget tips",
  "vendorSuggestions": ["Vendor 1", "Vendor 2"],
  "timelineAdvice": "Timeline advice"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: isId
            ? 'Kamu adalah expert wedding planner untuk pernikahan Bali. Berikan rekomendasi yang spesifik, actionable, dan personal untuk setiap kasus. Jawab HANYA dengan JSON valid, tanpa markdown atau text tambahan.'
            : 'You are an expert wedding planner for Bali weddings. Provide specific, actionable, and personalized recommendations for each case. Answer ONLY with valid JSON, without markdown or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      try {
        return JSON.parse(response);
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        return null;
      }
    }
    
    return null;
  } catch (error: any) {
    // Handle rate limit and quota errors silently (already have fallback)
    if (error?.status === 429 || error?.code === 'insufficient_quota' || error?.code === 'rate_limit_exceeded') {
      // Silently fallback to smart matching - user experience not affected
      console.log('OpenAI API quota exceeded - using smart fallback (this is normal)');
      return null;
    }
    // Only log unexpected errors
    console.error('AI Recommendations Error:', error);
    return null;
  }
}

// Generate smart budget optimization suggestions
function getSmartBudgetTips(budget: number, guestCount: number, lang: Language): string {
  const isId = lang === 'id';
  const perPerson = budget / guestCount;
  
  let tips = '';
  
  if (budget < 10000) {
    tips = isId
      ? `Dengan budget $${budget.toLocaleString()} untuk ${guestCount} tamu ($${Math.round(perPerson)}/orang), fokus pada:
• Venue intim (villa atau pantai lokal) - alokasikan 35-40% budget
• Katering lokal - $30-40/orang untuk kualitas bagus
• Fotografer lokal berpengalaman - $800-1,500 untuk paket lengkap
• Dekorasi minimalis tapi elegan - gunakan bunga lokal (plumeria, frangipani)
• Pilih weekday untuk diskon 20-30%
• Musim hujan bisa hemat 15-25%`
      : `With a $${budget.toLocaleString()} budget for ${guestCount} guests ($${Math.round(perPerson)}/person), focus on:
• Intimate venues (villa or local beach) - allocate 35-40% of budget
• Local catering - $30-40/person for good quality
• Experienced local photographers - $800-1,500 for full package
• Minimalist but elegant decor - use local flowers (plumeria, frangipani)
• Choose weekdays for 20-30% discount
• Wet season can save 15-25%`;
  } else if (budget < 25000) {
    tips = isId
      ? `Dengan budget $${budget.toLocaleString()} untuk ${guestCount} tamu ($${Math.round(perPerson)}/orang), Anda punya fleksibilitas lebih:
• Pilih venue mid-range (beach resort atau villa premium) - 40-45% budget
• Katering internasional atau premium lokal - $50-70/orang
• Fotografer/videografer paket - $2,000-3,500
• Dekorasi floral lebih lengkap - $1,500-2,500
• Entertainment (DJ atau live acoustic) - $500-1,200
• Pertimbangkan dry season untuk cuaca terbaik`
      : `With a $${budget.toLocaleString()} budget for ${guestCount} guests ($${Math.round(perPerson)}/person), you have more flexibility:
• Choose mid-range venues (beach resort or premium villa) - 40-45% budget
• International or premium local catering - $50-70/person
• Photo/video package - $2,000-3,500
• More complete floral decor - $1,500-2,500
• Entertainment (DJ or live acoustic) - $500-1,200
• Consider dry season for best weather`;
  } else {
    tips = isId
      ? `Dengan budget $${budget.toLocaleString()} untuk ${guestCount} tamu ($${Math.round(perPerson)}/orang), Anda bisa merencanakan pernikahan mewah:
• Luxury resort atau villa eksklusif - 40-45% budget
• Catering internasional premium - $80-120/orang
• Fotografer/videografer top-tier - $3,000-5,000+
• Dekorasi mewah dengan floral installations - $3,000-5,000+
• Live band atau DJ premium - $1,200-2,500
• Dry season recommended untuk experience optimal`
      : `With a $${budget.toLocaleString()} budget for ${guestCount} guests ($${Math.round(perPerson)}/person), you can plan a luxurious wedding:
• Luxury resort or exclusive villa - 40-45% budget
• Premium international catering - $80-120/person
• Top-tier photographer/videographer - $3,000-5,000+
• Luxury decor with floral installations - $3,000-5,000+
• Live band or premium DJ - $1,200-2,500
• Dry season recommended for optimal experience`;
  }
  
  return tips;
}

export async function POST(request: NextRequest) {
  try {
    const { guestCount, budget, venueType, season, language = 'en' } = await request.json();
    const lang = (language === 'id' ? 'id' : 'en') as Language;
    
    // Try AI recommendations first
    const aiRecommendations = await getAIRecommendations(guestCount, budget, venueType, season, lang);
    
    // Get smart venue matches from our database
    const matchedVenues = getSmartVenueMatches(guestCount, budget, venueType, season, venuesData);
    
    // Get budget tips
    const budgetTips = aiRecommendations?.budgetTips || getSmartBudgetTips(budget, guestCount, lang);
    
    // Vendor suggestions
    const vendorSuggestions = aiRecommendations?.vendorSuggestions || [
      lang === 'id' 
        ? 'Fotografer lokal berpengalaman (cek portfolio)'
        : 'Experienced local photographer (check portfolio)',
      lang === 'id'
        ? 'Katering yang terbiasa dengan pernikahan internasional'
        : 'Catering experienced with international weddings',
      lang === 'id'
        ? 'Florist dengan akses ke bunga lokal dan impor'
        : 'Florist with access to local and imported flowers'
    ];
    
    // Timeline advice
    const timelineAdvice = aiRecommendations?.timelineAdvice || 
      (lang === 'id'
        ? `Booking venue 9-12 bulan sebelumnya untuk ${season === 'april-october' ? 'musim kemarau' : 'musim hujan'}. Submit dokumen pernikahan 1 bulan sebelumnya. Final briefing dengan semua vendor 2 minggu sebelum pernikahan.`
        : `Book venue 9-12 months in advance for ${season === 'april-october' ? 'dry season' : 'wet season'}. Submit marriage paperwork 1 month before. Final briefing with all vendors 2 weeks before wedding.`);
    
    return NextResponse.json({
      success: true,
      source: aiRecommendations ? 'ai' : 'smart',
      venues: matchedVenues.slice(0, 6).map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        location: v.location,
        price: v.price,
        guests: v.guests,
        description: v.description,
        matchScore: aiRecommendations?.venues?.find((av: any) => 
          av.name.toLowerCase().includes(v.name.toLowerCase()) ||
          v.name.toLowerCase().includes(av.name.toLowerCase())
        )?.matchScore || 85
      })),
      aiVenueSuggestions: aiRecommendations?.venues || [],
      budgetTips,
      vendorSuggestions,
      timelineAdvice,
      recommendations: {
        bestFor: lang === 'id'
          ? `${guestCount} tamu dengan budget $${budget.toLocaleString()} di ${venueType} selama ${season === 'april-october' ? 'musim kemarau' : 'musim hujan'}`
          : `${guestCount} guests with $${budget.toLocaleString()} budget at ${venueType} venue during ${season === 'april-october' ? 'dry season' : 'wet season'}`,
        priority: lang === 'id'
          ? 'Fokus pada venue yang sesuai kapasitas dan budget, lalu vendor photography untuk kenangan abadi'
          : 'Focus on venues matching capacity and budget, then photography vendors for lasting memories'
      }
    });
    
  } catch (error) {
    console.error('Recommendations API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recommendations',
      message: 'Please try again or contact support'
    }, { status: 500 });
  }
}

