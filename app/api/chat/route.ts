// app/api/chat/route.ts - FULLY COMPLETE WITH AI INTEGRATION
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

type Language = 'en' | 'id';

// Initialize OpenAI client (with fallback if no API key)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Helper functions for personalized recommendations
function getVenueRecommendations(venueType: string, guestCount: number) {
  const venues: { [key: string]: string[] } = {
    beach: ['Jimbaran Bay Beach Club', 'Nusa Dua Beach Hotel', 'Uluwatu Surf Villas', 'Seminyak Beach Resort'],
    villa: ['Ubud Private Estate', 'Seminyak Luxury Villa', 'Canggu Cliff House', 'Pererenan Eco Villa'],
    resort: ['Ayana Resort', 'Four Seasons Jimbaran', 'St. Regis Bali', 'W Bali Seminyak']
  };
  
  return venues[venueType]?.join(', ') || 'various excellent options';
}

function getPersonalizedAdvice(context: any, lang: Language = 'en') {
  const { guestCount, budget, venueType, season } = context;
  
  if (lang === 'id') {
    const venueTypeMap: { [key: string]: string } = {
      beach: 'pantai',
      villa: 'villa',
      resort: 'resor'
    };
    
    const seasonText = season === 'april-october' ? 'musim kemarau (paling populer)' : 'musim hujan (tarif lebih baik)';
    const guestText = guestCount <= 50 ? 'Sempurna untuk perayaan intim dan personal' : 
      guestCount <= 100 ? 'Ukuran bagus untuk interaksi bermakna dengan semua tamu' : 
      'Pertimbangkan beberapa zona hiburan untuk kenyamanan tamu';
    
    return `RENCANA PERNIKAHAN YANG DIPERSONALISASI:

STRATEGI VENUE:
Hubungi venue ${venueTypeMap[venueType || 'beach']} ini terlebih dahulu: ${getVenueRecommendations(venueType, guestCount)}

OPTIMASI BUDGET ($${budget.toLocaleString()}):
${getBudgetTips(budget, lang)}

TIMELINE:
Booking venue ${venueTypeMap[venueType || 'beach']} Anda 9-12 bulan sebelumnya untuk ${seasonText}

MANAJEMEN TAMU (${guestCount} tamu):
${guestText}

TIP AHLI:
${getProTips(venueType, guestCount, lang)}

LANGKAH SELANJUTNYA:
1. Hubungi 3-5 venue dari daftar di atas
2. Jadwalkan video call dengan 2 pilihan utama Anda
3. Saya dapat membantu membandingkan proposal dan menegosiasikan paket yang lebih baik`;
  }
  
  return `YOUR PERSONALIZED WEDDING PLAN:

VENUE STRATEGY:
Contact these ${venueType} venues first: ${getVenueRecommendations(venueType, guestCount)}

BUDGET OPTIMIZATION ($${budget.toLocaleString()}):
${getBudgetTips(budget, lang)}

TIMELINE:
Book your ${venueType} venue 9-12 months in advance for ${season === 'april-october' ? 'dry season dates (most popular)' : 'wet season availability (better rates)'}

GUEST MANAGEMENT (${guestCount} guests):
${guestCount <= 50 ? 'Perfect for intimate, personalized celebrations' : 
  guestCount <= 100 ? 'Great size for meaningful interactions with all guests' : 
  'Consider multiple entertainment zones for guest comfort'}

EXPERT TIPS:
${getProTips(venueType, guestCount, lang)}

NEXT STEPS:
1. Contact 3-5 venues from my list above
2. Schedule video calls with your top 2 choices
3. I can help compare proposals and negotiate better packages`;
}

function getBudgetTips(budget: number, lang: Language = 'en') {
  if (lang === 'id') {
    if (budget < 10000) return 'pada venue intim dan vendor lokal sambil mempertahankan kualitas';
    if (budget < 25000) return 'pada keseimbangan vendor premium dengan budget Anda - fokus pada prioritas utama';
    return 'pada pengalaman mewah dan vendor kelas atas - Anda punya fleksibilitas besar';
  }
  
  if (budget < 10000) return 'on intimate venues and local vendors while maintaining quality';
  if (budget < 25000) return 'on balancing premium vendors with your budget - focus on key priorities';
  return 'on luxury experiences and top-tier vendors - you have great flexibility';
}

function getProTips(venueType: string, guestCount: number, lang: Language = 'en') {
  if (lang === 'id') {
    const tipsId: { [key: string]: string } = {
      beach: `• Upacara sunset sekitar pukul 17-18 untuk foto golden hour yang menawan
• Selalu siapkan rencana cadangan hujan (sewa tenda atau ruang indoor)
• Pertimbangkan akses pantai untuk tamu lanjut usia - golf cart bisa membantu
• Jadwal pasang surut sangat penting - periksa waktu pasang surut
• Regulasi suara dapat membatasi volume musik malam hari`,
      villa: `• Sempurna untuk acara pernikahan multi-hari dan akomodasi tamu
• Sangat baik untuk privasi lengkap dan kustomisasi setiap detail
• Periksa regulasi suara lokal untuk perayaan malam hari
• Pertimbangkan parkir dan transportasi untuk tamu
• Staf villa sering kali dapat membantu dengan rekomendasi vendor lokal`,
      resort: `• Paket all-inclusive sering memberikan nilai lebih baik daripada à la carte
• Blok kamar tamu bisa dinegosiasikan untuk tarif lebih baik
• Wedding planner resort memiliki pengalaman lokal yang luas
• Beberapa opsi venue dalam satu properti menyediakan cadangan hujan
• Standar layanan dan fasilitas internasional`
    };
    
    const defaultTipId = `• Booking 9-12 bulan sebelumnya untuk ketersediaan tanggal terbaik
• Pertimbangkan transportasi tamu antara akomodasi dan venue
• Dokumen pernikahan Bali membutuhkan 2-3 hari untuk diproses`;
    
    return tipsId[venueType] || defaultTipId;
  }
  
  const tips: { [key: string]: string } = {
    beach: `• Sunset ceremonies around 5-6PM for magical golden hour photos
• Always have a rain backup plan (rent a marquee or indoor space)
• Consider beach access for elderly guests - golf carts can help
• Tide schedules are crucial - check high/low tide times
• Sound regulations may limit evening music volume`,
    villa: `• Perfect for multi-day wedding events and guest accommodations
• Great for complete privacy and customization of every detail
• Check local sound regulations for evening celebrations
• Consider parking and transportation for guests
• Villa staff can often help with local vendor recommendations`,
    resort: `• All-inclusive packages often provide better value than à la carte
• Guest room blocks can be negotiated for better rates
• Resort wedding planners have extensive local experience
• Multiple venue options within one property provide rain backups
• International standards of service and amenities`
  };
  
  const defaultTip = `• Book 9-12 months in advance for best date availability
• Consider guest transportation between accommodations and venue
• Bali marriage paperwork takes 2-3 days to process`;
  
  return tips[venueType] || defaultTip;
}

// Build conversation context for AI
function buildSystemPrompt(context: any, conversationHistory: any[], lang: Language): string {
  const isId = lang === 'id';
  
  let systemPrompt = isId 
    ? `Kamu adalah asisten AI yang ahli dalam perencanaan pernikahan Bali. Kamu membantu pasangan merencanakan pernikahan impian mereka di Bali dengan memberikan saran tentang venue, budget, vendor, timeline, dan tradisi Bali.`
    : `You are an expert AI assistant specializing in Bali wedding planning. You help couples plan their dream Bali weddings by providing advice on venues, budgets, vendors, timelines, and Balinese traditions.`;

  if (context?.fromPlanner) {
    systemPrompt += isId
      ? `\n\nContext User: ${context.guestCount} tamu, budget $${context.budget.toLocaleString()}, venue ${context.venueType}, ${context.season === 'april-october' ? 'musim kemarau' : 'musim hujan'}.`
      : `\n\nUser Context: ${context.guestCount} guests, $${context.budget.toLocaleString()} budget, ${context.venueType} venue, ${context.season === 'april-october' ? 'dry season' : 'wet season'}.`;
  }

  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-6); // Last 6 messages for context
    systemPrompt += isId ? '\n\nRiwayat percakapan sebelumnya:\n' : '\n\nPrevious conversation:\n';
    recentHistory.forEach((msg: any) => {
      systemPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 200)}\n`;
    });
  }

  return systemPrompt;
}

// Extract key information from conversation history and current message
function extractContextUpdates(message: string, conversationHistory: any[]): any {
  const updates: any = {};
  
  // Extract guest count - check current message FIRST, then conversation history (most recent first)
  // Patterns to match: "28 tamu", "tamu 28", "bisa 45 tamu enggak", "45 tamu", etc.
  const guestPatterns = [
    /(?:jadinya|jadi|revisi|update|ubah|bukan)\s*(\d+)/gi, // "jadinya 28", "revisi 28", "bukan 38" -> prioritize revision words
    /(?:bisa|can|mau|want|ingin|planning)\s*(\d+)(?:\s+(?:tamu|guest|people|orang|person))?/gi, // "bisa 45 tamu", "mau 45 tamu" - HIGH PRIORITY
    /(\d+)\s+(?:tamu|guest|people|orang|person)/gi, // "45 tamu", "28 people" - most common pattern
    /(?:tamu|guest|people|orang|person)\s+(\d+)/gi, // "tamu 28"
    /(\d+)\s+(?:bro|aja|saja|only)/gi, // "28 bro", "28 aja"
    /\b(\d+)\b(?=.*?(?:tamu|guest|people|orang|person))/gi // Any number before guest-related word (fallback)
  ];
  
  // Check current message first (highest priority)
  let foundCount: number | null = null;
  let allMatches: Array<{count: number, index: number}> = [];
  
  // Collect all matches from current message
  for (const pattern of guestPatterns) {
    const matches = Array.from(message.toLowerCase().matchAll(pattern)) as RegExpMatchArray[];
    for (const match of matches) {
      const count = parseInt(match[1] || match[2] || '0');
      if (count > 0 && count <= 1000 && match.index !== undefined) {
        allMatches.push({ count, index: match.index });
      }
    }
  }
  
  if (allMatches.length > 0) {
    // Check for "bukan X" pattern - if found, exclude X from consideration
    const bukanMatches = Array.from(message.toLowerCase().matchAll(/(?:bukan|not)\s*(\d+)/gi)) as RegExpMatchArray[];
    const excludedCounts = new Set(bukanMatches.map(m => parseInt(m[1])));
    
    // Filter out excluded counts
    let validMatches = allMatches.filter(m => !excludedCounts.has(m.count));
    
    // If all matches were excluded, use all matches (fallback)
    if (validMatches.length === 0) {
      validMatches = allMatches;
    }
    
    // If there are revision keywords, prioritize matches near them
    const hasRevision = /(?:jadinya|revisi|update|ubah|bukan)/gi.test(message);
    if (hasRevision && !bukanMatches.length) {
      // Find matches near revision words (but not "bukan X" patterns)
      const revisionMatches = validMatches.filter(m => {
        const beforeMatch = message.toLowerCase().substring(Math.max(0, m.index - 20), m.index);
        return /(?:jadinya|revisi|update|ubah)/gi.test(beforeMatch);
      });
      if (revisionMatches.length > 0) {
        // Get the one with highest index (most recent in message)
        foundCount = revisionMatches.sort((a, b) => b.index - a.index)[0].count;
      } else {
        // No revision match found, use last match overall
        foundCount = validMatches.sort((a, b) => b.index - a.index)[0].count;
      }
    } else {
      // Use the last match (most recent) - after excluding "bukan X"
      foundCount = validMatches.sort((a, b) => b.index - a.index)[0].count;
    }
  }
  
  // If not found in current message, check conversation history (most recent first)
  if (foundCount === null) {
    // Reverse conversation history to check most recent first
    const reversedHistory = [...conversationHistory].reverse();
    for (const historyMsg of reversedHistory) {
      if (historyMsg.role === 'user') { // Only check user messages
        for (const pattern of guestPatterns) {
          const matches = Array.from(historyMsg.content.toLowerCase().matchAll(pattern)) as RegExpMatchArray[];
          if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            const count = parseInt(lastMatch[1] || lastMatch[2] || '0');
            if (count > 0 && count <= 1000) {
              foundCount = count;
              break;
            }
          }
        }
        if (foundCount !== null) break;
      }
    }
  }
  
  if (foundCount !== null) {
    updates.guestCount = foundCount;
    // Debug log (remove in production)
    console.log(`[Context Update] Extracted guest count: ${foundCount} from message: "${message}"`);
  } else {
    console.log(`[Context Update] No guest count found in message: "${message}"`);
  }
  
  // Extract budget (looking for numbers with $ or "budget", "dana", "biaya")
  const messageLower = message.toLowerCase();
  const budgetPatterns = [
    /\$\s*(\d+[,\d]*)/g,
    /(?:budget|dana|biaya)\s*(?:adalah|is|sebesar|of)?\s*(?:rp|rp\.)?\s*(\d+[,\d]*)/gi,
    /(\d+[,\d]*)\s*(?:dollar|usd|rp|rupiah|ribu|k)/gi
  ];
  
  let allBudgetMatches: Array<{match: RegExpMatchArray, position: number}> = [];
  for (const pattern of budgetPatterns) {
    let match;
    const patternCopy = new RegExp(pattern.source, pattern.flags);
    while ((match = patternCopy.exec(messageLower)) !== null) {
      allBudgetMatches.push({
        match: match,
        position: match.index || 0
      });
    }
  }
  
  if (allBudgetMatches.length > 0) {
    // Sort by position to get the LAST (most recent) mention
    allBudgetMatches.sort((a, b) => b.position - a.position);
    const lastMatch = allBudgetMatches[0].match;
    const budgetStr = (lastMatch[1] || lastMatch[2] || '0').replace(/,/g, '');
    // Handle "ribu" or "k" suffix (e.g., "7 ribu" = 7000)
    let budget = parseInt(budgetStr);
    if (messageLower.includes('ribu') || messageLower.includes('k')) {
      budget = budget * 1000;
    }
    if (budget > 0 && budget <= 1000000) {
      updates.budget = budget;
    }
  }
  
  // Extract venue type
  if (messageLower.includes('villa') || messageLower.includes('pribadi')) {
    updates.venueType = 'villa';
  } else if (messageLower.includes('resort') || messageLower.includes('resor') || messageLower.includes('mewah')) {
    updates.venueType = 'resort';
  } else if (messageLower.includes('beach') || messageLower.includes('pantai')) {
    updates.venueType = 'beach';
  }
  
  // Extract season
  if (messageLower.includes('wet') || messageLower.includes('rain') || messageLower.includes('hujan')) {
    updates.season = 'november-march';
  } else if (messageLower.includes('dry') || messageLower.includes('kemarau')) {
    updates.season = 'april-october';
  }
  
  return updates;
}

// Get smart fallback response (existing logic)
function getSmartFallbackResponse(message: string, context: any, conversationHistory: any[], lang: Language): string {
  const lowerMessage = message.toLowerCase();
  
  // Extract and update context from conversation
  const contextUpdates = extractContextUpdates(message, conversationHistory);
  const updatedContext = context?.fromPlanner 
    ? { ...context, ...contextUpdates }
    : (contextUpdates.guestCount || contextUpdates.budget ? { ...context, ...contextUpdates, fromPlanner: false } : context);
  
  // Debug log (remove in production)
  console.log(`[Context Update] Original context:`, context);
  console.log(`[Context Update] Extracted updates:`, contextUpdates);
  console.log(`[Context Update] Updated context:`, updatedContext);
  
  // Jika user datang dari planner dengan context tertentu, atau ada updated context
  if (updatedContext?.fromPlanner || updatedContext?.guestCount || updatedContext?.budget) {
    const venueTypeMap: { [key: string]: { en: string; id: string } } = {
      beach: { en: 'beach', id: 'pantai' },
      villa: { en: 'villa', id: 'villa' },
      resort: { en: 'resort', id: 'resor' }
    };
    
    const finalGuestCount = updatedContext.guestCount || 50;
    const finalBudget = updatedContext.budget || 10000;
    const finalVenueType = updatedContext.venueType || 'beach';
    const finalSeason = updatedContext.season || 'april-october';
    
    const seasonText = finalSeason === 'april-october' 
      ? (lang === 'id' ? 'musim kemarau' : 'dry season')
      : (lang === 'id' ? 'musim hujan' : 'wet season');
    
    // Prepare context for personalized advice
    const adviceContext = {
      guestCount: finalGuestCount,
      budget: finalBudget,
      venueType: finalVenueType,
      season: finalSeason
    };
    
    if (lang === 'id') {
      return `Sempurna! Saya lihat Anda merencanakan pernikahan untuk ${finalGuestCount} tamu dengan budget $${finalBudget.toLocaleString()}. 

Berdasarkan preferensi venue ${venueTypeMap[finalVenueType].id} Anda selama ${seasonText}:

${getPersonalizedAdvice(adviceContext, lang)}

Aspek spesifik apa yang ingin saya bantu selanjutnya? Saya dapat menyediakan:
• Rekomendasi vendor detail
• Optimasi rincian budget  
• Pembuatan timeline
• Panduan dokumen pernikahan
• Peningkatan pengalaman tamu

Beri tahu saya apa yang ingin Anda fokuskan!`;
    }
    
    return `Perfect! I see you're planning a wedding for ${finalGuestCount} guests with a $${finalBudget.toLocaleString()} budget. 

Based on your ${venueTypeMap[finalVenueType].en} venue preference during ${seasonText}:

${getPersonalizedAdvice(adviceContext, lang)}

What specific aspect would you like me to help with next? I can provide:
• Detailed vendor recommendations
• Budget breakdown optimization  
• Timeline creation
• Marriage paperwork guidance
• Guest experience enhancements

Just let me know what you'd like to focus on!`;
  }
  
  // Regular smart responses
  if (lowerMessage.includes('beach') || lowerMessage.includes('venue') || lowerMessage.includes('place')) {
    return `BEACH WEDDING VENUES IN BALI:

TOP RECOMMENDATIONS BY AREA:

Jimbaran Bay - Best for Sunset Ceremonies
• Four Seasons Jimbaran (Luxury, 50-120 guests)
• Intercontinental Bali (Classic, 80-200 guests) 
• Ayana Resort (Multiple venues, 30-300 guests)

Nusa Dua - Best for Luxury Resorts
• St. Regis Bali (Ultra-luxury, 50-100 guests)
• The Mulia (Grand ballrooms + beach, 100-300 guests)
• Sofitel Bali (Elegant, 60-150 guests)

Uluwatu - Best for Ocean Cliffs
• Alila Villas Uluwatu (Infinity pool cliffs, 20-80 guests)
• Bvlgari Resort (Exclusive, 30-60 guests)
• Karma Kandara (Dramatic views, 40-100 guests)

Sanur - Best for Calm Beaches
• Andaz Bali (Modern beachfront, 40-120 guests)
• Hyatt Regency (Family-friendly, 50-200 guests)

BUDGET RANGES:
• Standard: $3,000 - $7,000
• Premium: $7,000 - $15,000  
• Luxury: $15,000 - $30,000+
• Ultra-Luxury: $30,000+

TIPS:
• Dry season (Apr-Oct) books 9-12 months out
• Weekday weddings save 20-30%
• Consider both sunset and morning ceremonies

What's your guest count and preferred area? I can give more specific recommendations!`;
  } 
  
  else if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
    return `BALI WEDDING BUDGET PLANNER:

TYPICAL BUDGET RANGES:

Intimate Wedding (20-50 guests)
• Total: $5,000 - $15,000
• Venue: $2,000 - $5,000
• Catering: $1,500 - $4,000
• Photography: $800 - $2,000

Medium Wedding (50-100 guests)  
• Total: $15,000 - $30,000
• Venue: $5,000 - $10,000
• Catering: $4,000 - $8,000
• Photography: $1,500 - $3,000

Large Wedding (100-200 guests)
• Total: $30,000 - $60,000+
• Venue: $10,000 - $20,000
• Catering: $8,000 - $15,000
• Photography: $2,500 - $5,000

DETAILED BREAKDOWN:
• Venue: 35-45%
• Catering: 25-30% 
• Photography/Videography: 10-15%
• Decor & Flowers: 10-12%
• Wedding Planner: 8-10%
• Entertainment: 5-8%
• Miscellaneous: 5-8%

MONEY-SAVING STRATEGIES:
• Weekday weddings: 20-30% savings
• Off-peak season (Nov-Mar): 15-25% savings  
• Local flowers vs imported: 40-60% savings
• Digital invitations: 80% savings
• Package deals with venues: 10-15% savings
• Negotiate vendor packages: 5-10% savings

BUDGET PRIORITIZATION:
1. Photography (memories last forever)
2. Venue (sets the entire experience)  
3. Catering (guest satisfaction)
4. Music/Entertainment (atmosphere)

What's your estimated guest count and total budget? I can create a customized budget plan!`;
  }
  
  else if (lowerMessage.includes('vendor') || lowerMessage.includes('photographer') || lowerMessage.includes('catering') || lowerMessage.includes('florist')) {
    return `BALI WEDDING VENDOR GUIDE:

RECOMMENDED VENDOR RANGES:

Photography & Videography
• Local photographers: $800 - $1,800
• International photographers: $2,000 - $5,000+
• Videography: $1,200 - $3,500
• Photo + Video packages: $2,000 - $6,000

Catering & Beverages
• Local catering: $30 - $50 per person
• International catering: $50 - $100+ per person
• Open bar packages: $25 - $60 per person
• Wedding cake: $200 - $800

Florists & Decor
• Basic floral arrangements: $500 - $1,500
• Elaborate installations: $1,500 - $5,000+
• Ceremony arch: $300 - $1,200
• Table centerpieces: $50 - $150 each

Makeup & Hair
• Bride + trial: $200 - $400
• Bridesmaids: $80 - $150 each
• Mother of bride: $60 - $120

Entertainment
• DJ: $400 - $1,200
• Live band: $800 - $2,500
• Traditional Balinese dancers: $200 - $500

TRUSTED VENDOR NETWORKS:
• Bali Wedding Organizers Association
• Luxe Bali Weddings
• The Bali Wedding Planners
• Asian Wedding Academy

VENDOR SELECTION TIPS:
• Always review full portfolios
• Check recent reviews and references
• Schedule video calls before booking
• Understand exactly what's included
• Ask about backup equipment/assistants

Which vendor type are you most interested in? I can provide specific recommendations based on your style and budget!`;
  }
  
  else if (lowerMessage.includes('timeline') || lowerMessage.includes('schedule') || lowerMessage.includes('when')) {
    return `BALI WEDDING PLANNING TIMELINE:

IDEAL PLANNING SCHEDULE:

12+ MONTHS BEFORE
• Set budget and guest count estimate
• Book wedding venue (most important!)
• Hire wedding planner (recommended for Bali)
• Research and book photographer/videographer

9-12 MONTHS BEFORE  
• Send save-the-date notices
• Start dress/suit shopping
• Book caterer and other key vendors
• Reserve guest accommodations

6-9 MONTHS BEFORE
• Finalize guest list
• Book florist, music, makeup artists
• Plan honeymoon and travel
• Schedule engagement photos

3-6 MONTHS BEFORE
• Order wedding invitations
• Finalize menu and decor plans
• Book marriage paperwork agent
• Plan rehearsal dinner

1-3 MONTHS BEFORE
• Send wedding invitations
• Final dress fitting
• Create seating chart
• Final payments to vendors

1 MONTH BEFORE
• Marriage paperwork submission
• Final briefings with all vendors
• Pack for destination wedding
• Confirm guest arrivals

BEST MONTHS FOR BALI WEDDINGS:
• Dry Season (April-October): Perfect weather, higher prices, more competition
• Shoulder Months (April, May, October): Great weather, better availability
• Wet Season (November-March): Lower prices, possible rain showers, lush greenery

BALI MARRIAGE PAPERWORK:
• Takes 2-3 business days to process
• Requires original documents
• Need 2 witnesses
• Can use wedding planner services

When are you thinking of having your wedding? I can create a customized timeline based on your date!`;
  }

  else if (lowerMessage.includes('traditional') || lowerMessage.includes('balinese') || lowerMessage.includes('culture')) {
    return `BALINESE WEDDING TRADITIONS:

TRADITIONAL BALINESE ELEMENTS YOU CAN INCORPORATE:

Melukat Purification Ceremony
• Spiritual cleansing before the wedding
• Performed by Balinese priest (Pemangku)
• Involves holy water and prayers
• Duration: 1-2 hours
• Cost: $200 - $500

Sesanti Wedding Ceremony 
• Traditional Balinese Hindu ceremony
• Includes offerings, prayers, and blessings
• Couple wears traditional Balinese attire
• Duration: 2-3 hours  
• Cost: $800 - $2,000

Traditional Balinese Dancers
• Welcome dancers for guest arrival
• Performance during cocktail hour
• Multiple dance styles available
• Cost: $200 - $500 per performance

Canang Sari Offerings
• Beautiful daily offerings
• Can be part of your decor
• Symbolize gratitude and balance
• Cost: $100 - $300 for wedding

Traditional Attire Options
• Full Balinese wedding costume
• Modern dress with Balinese elements
• Guest sarongs can be provided

MODERN + TRADITIONAL FUSION IDEAS:
• Western ceremony + Balinese blessing
• Traditional welcome + modern reception
• Balinese dancers during cocktail hour
• Canang sari as table centerpieces
• Traditional music during dinner

FINDING A BALINESE PRIEST:
Your wedding planner can arrange everything - they work with trusted priests who are comfortable with international couples.

Would you like me to explain any of these traditions in more detail? I can help you create a beautiful fusion ceremony!`;
  }
  
  // Default fallback response
  return lang === 'id' 
    ? `Saya siap membantu Anda merencanakan pernikahan Bali impian Anda!

Berikut yang dapat saya bantu:

PEMILIHAN VENUE
• Rekomendasi pantai, villa, atau resort
• Saran khusus area (Ubud, Seminyak, Uluwatu, dll.)
• Opsi ramah budget hingga mewah

PERENCANAAN BUDGET 
• Rincian biaya detail
• Strategi menghemat uang
• Tips optimasi budget

KONEKSI VENDOR
• Fotografer, videografer, katering
• Floris, dekorator, makeup artist
• Hiburan dan musik

PEMBUATAN TIMELINE
• Jadwal perencanaan 12 bulan
• Panduan dokumen pernikahan
• Optimasi timeline hari pernikahan

KEAHLIAN LOKAL
• Tradisi dan upacara Bali
• Pertimbangan cuaca
• Peningkatan pengalaman tamu

OPSI MULAI CEPAT:
1. Beri tahu jumlah tamu dan budget untuk saran yang dipersonalisasi
2. Tanyakan tentang area atau jenis venue tertentu
3. Dapatkan rekomendasi vendor untuk prioritas Anda
4. Pelajari tentang tradisi pernikahan Bali

Apa yang ingin Anda jelajahi terlebih dahulu? Anda juga bisa menggunakan Wedding Planner kami untuk pengalaman terpandu langkah demi langkah!`
    : `I'd love to help you plan your dream Bali wedding!

Here's what I can assist with:

VENUE SELECTION
• Beach, villa, or resort recommendations
• Area-specific advice (Ubud, Seminyak, Uluwatu, etc.)
• Budget-friendly to luxury options

BUDGET PLANNING 
• Detailed cost breakdowns
• Money-saving strategies
• Budget optimization tips

VENDOR CONNECTIONS
• Photographers, videographers, caterers
• Florists, decorators, makeup artists
• Entertainment and music

TIMELINE CREATION
• 12-month planning schedule
• Marriage paperwork guidance
• Day-of timeline optimization

LOCAL EXPERTISE
• Balinese traditions and ceremonies
• Weather considerations
• Guest experience enhancements

QUICK START OPTIONS:
1. Tell me your guest count and budget for personalized advice
2. Ask about specific areas or venue types
3. Get vendor recommendations for your priorities
4. Learn about Balinese wedding traditions

What would you like to explore first? You can also use our Wedding Planner for a step-by-step guided experience!`;
}

export async function POST(request: NextRequest) {
  let requestBody: any = {};
  let lang: Language = 'en';
  
  try {
    requestBody = await request.json();
    const { message, context, language = 'en', conversationHistory = [] } = requestBody;
    lang = (language === 'id' ? 'id' : 'en') as Language;
    
    // Try OpenAI API first if available
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        const systemPrompt = buildSystemPrompt(context, conversationHistory, lang);
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-10).map((msg: any) => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        if (aiResponse) {
          return NextResponse.json({
            response: aiResponse,
            source: 'ai'
          });
        }
      } catch (aiError: any) {
        console.error('OpenAI API Error:', aiError);
        // Fall through to smart responses
      }
    }
    
    // Fallback to smart responses
    return NextResponse.json({
      response: getSmartFallbackResponse(message, context, conversationHistory, lang),
      source: 'smart'
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    // Use language from parsed request body if available
    const isId = (requestBody?.language || 'en') === 'id';
    
    return NextResponse.json({
      response: isId
        ? `Maaf, saya mengalami kesulitan saat ini. Berikut beberapa tips cepat:

Area Pernikahan Bali Populer:
• Seminyak - Trendy, restoran bagus
• Uluwatu - Pemandangan laut tebing  
• Ubud - Setting hutan dan sungai
• Nusa Dua - Resort mewah
• Jimbaran - Sunset indah

Perencanaan Budget:
Mulai dengan $5,000-$10,000 untuk pernikahan intim, $15,000-$30,000 untuk ukuran sedang.

Waktu:
Booking venue 9-12 bulan sebelumnya, terutama untuk musim kemarau (April-Oktober).

Silakan coba pertanyaan Anda lagi, atau gunakan Wedding Planner kami untuk panduan langkah demi langkah!`
        : `I'm here to help with your Bali wedding planning!

It seems I'm having a temporary issue. Here are some quick tips:

Popular Bali Wedding Areas:
• Seminyak - Trendy, great restaurants
• Uluwatu - Cliffside ocean views  
• Ubud - Jungle and river settings
• Nusa Dua - Luxury resorts
• Jimbaran - Beautiful sunsets

Budget Planning:
Start with $5,000-$10,000 for intimate weddings, $15,000-$30,000 for medium size.

Timing:
Book venues 9-12 months in advance, especially for dry season (April-October).

Please try your question again, or use our Wedding Planner for step-by-step guidance!`,
      source: 'error'
    });
  }
}
