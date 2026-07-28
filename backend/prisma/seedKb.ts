/**
 * Knowledge-base seed for the RAG assistant.
 *
 * The assistant (src/services/assistantService.ts) is instructed to answer
 * ONLY from retrieved kb_articles + live context. Until this table is
 * populated, retrieveChunks() returns nothing and every answer becomes
 * "I don't have enough information". This seed grounds the assistant in the
 * platform's real policies, flows, and terminology.
 *
 * Categories match the schema comment on model KbArticle:
 *   'policy' | 'faq' | 'provider_info' | 'booking_guide' | 'credits'
 * Languages: 'en' | 'ne' (Devanagari). The retriever searches both and
 * prefers the user's detected language.
 *
 * Run standalone:   npx tsx prisma/seedKb.ts
 * Or import { seedKbArticles } into the main seed.
 */

import { PrismaClient } from '@prisma/client'

interface KbSeed {
  category: 'policy' | 'faq' | 'provider_info' | 'booking_guide' | 'credits'
  title: string
  content: string
  lang: 'en' | 'ne'
}

export const KB_ARTICLES: KbSeed[] = [
  // ─────────────────────────────────────────────────────────────
  // GENERAL / PLATFORM
  // ─────────────────────────────────────────────────────────────
  {
    category: 'faq',
    lang: 'en',
    title: 'What is BishwasSetu?',
    content: `BishwasSetu is Nepal's trust-first home services marketplace. It connects customers with verified local service providers — plumbers, electricians, painters, cleaners, and more. Every provider goes through KYC identity verification and earns a trust score based on completed jobs, reviews, and verified badges. Payments are protected through escrow, and eligible jobs come with a work guarantee. Customers can book scheduled visits or request emergency help, and both sides can chat in-app during a booking.`,
  },
  {
    category: 'faq',
    lang: 'ne',
    title: 'बिश्वाससेतु के हो?',
    content: `बिश्वाससेतु नेपालको भरपर्दो घरायसी सेवा मार्केटप्लेस हो। यसले ग्राहकहरूलाई प्रमाणित स्थानीय सेवा प्रदायकहरू — प्लम्बर, इलेक्ट्रिसियन, पेन्टर, सफाइकर्मी आदिसँग जोड्छ। हरेक प्रदायकले KYC पहिचान प्रमाणीकरण गर्नुपर्छ र सम्पन्न काम, समीक्षा तथा प्रमाणित ब्याजका आधारमा ट्रस्ट स्कोर कमाउँछन्। भुक्तानी एस्क्रोमार्फत सुरक्षित हुन्छ र योग्य कामहरूमा वर्क ग्यारेन्टी हुन्छ।`,
  },

  // ─────────────────────────────────────────────────────────────
  // BOOKING GUIDE
  // ─────────────────────────────────────────────────────────────
  {
    category: 'booking_guide',
    lang: 'en',
    title: 'How to book a service',
    content: `To book: 1) Search a category or use Smart Match to find nearby verified providers. 2) Open a provider profile to review their trust score, skills, badges, and reviews. 3) Choose a date and time, describe the job, and confirm. Your booking moves through these statuses: PENDING (waiting for provider to accept), ACCEPTED, IN_PROGRESS, COMPLETED, or CANCELLED. You can track the current status and message the provider from the booking page. Payment is collected into escrow and only released to the provider after the job is completed.`,
  },
  {
    category: 'booking_guide',
    lang: 'en',
    title: 'Cancelling or rescheduling a booking',
    content: `You can cancel a booking from the booking detail page while it is still PENDING or ACCEPTED. When cancelling you may be asked for a reason. If you paid into escrow and cancel before work starts, the held amount is returned per the refund policy. To reschedule, cancel and rebook, or ask the provider through in-booking chat to agree on a new time. Repeated last-minute cancellations can affect your account standing.`,
  },
  {
    category: 'booking_guide',
    lang: 'ne',
    title: 'सेवा कसरी बुक गर्ने',
    content: `बुक गर्न: १) श्रेणी खोज्नुहोस् वा Smart Match प्रयोग गरी नजिकका प्रमाणित प्रदायक फेला पार्नुहोस्। २) प्रदायकको प्रोफाइल हेरेर ट्रस्ट स्कोर, सीप, ब्याज र समीक्षा जाँच्नुहोस्। ३) मिति र समय छान्नुहोस्, कामको विवरण लेख्नुहोस् र पुष्टि गर्नुहोस्। बुकिङको स्थिति: PENDING, ACCEPTED, IN_PROGRESS, COMPLETED वा CANCELLED हुन्छ। भुक्तानी एस्क्रोमा राखिन्छ र काम सकिएपछि मात्र प्रदायकलाई दिइन्छ।`,
  },
  {
    category: 'booking_guide',
    lang: 'en',
    title: 'Emergency (urgent) service requests',
    content: `For urgent needs, use Emergency request instead of a scheduled booking. You share your category, location, and a short description. The platform dispatches the request to the nearest available verified providers, who can accept within a short time window. Once a provider accepts, it converts into a normal booking with escrow protection. If no provider accepts before the request expires, you can cancel and try again or book a scheduled visit.`,
  },

  // ─────────────────────────────────────────────────────────────
  // PROVIDER INFO — trust, KYC, badges
  // ─────────────────────────────────────────────────────────────
  {
    category: 'provider_info',
    lang: 'en',
    title: 'How the trust score works',
    content: `Every provider has a trust score from 0 to 100. It reflects real signals: KYC verification status, number of completed bookings, customer review ratings, verified skill and trust badges, and complaint history. Completing jobs well and collecting genuine positive reviews raises the score over time; confirmed complaints or fraud flags lower it. Providers also earn milestone badges as their completed-booking count grows. A higher trust score improves search ranking and customer confidence.`,
  },
  {
    category: 'provider_info',
    lang: 'ne',
    title: 'ट्रस्ट स्कोर कसरी काम गर्छ',
    content: `हरेक प्रदायकको ट्रस्ट स्कोर ० देखि १०० सम्म हुन्छ। यो KYC प्रमाणीकरण, सम्पन्न बुकिङको संख्या, ग्राहक समीक्षा, प्रमाणित सीप र ट्रस्ट ब्याज, तथा गुनासोको इतिहासमा आधारित हुन्छ। राम्रो काम गरेर साँचो सकारात्मक समीक्षा पाएमा स्कोर बढ्छ; पुष्टि भएको गुनासो वा फ्रड फ्ल्यागले घटाउँछ। उच्च ट्रस्ट स्कोरले खोजमा राम्रो स्थान दिन्छ।`,
  },
  {
    category: 'provider_info',
    lang: 'en',
    title: 'KYC identity verification for providers',
    content: `Providers must complete KYC (Know Your Customer) verification before taking bookings. You upload a government ID (Citizenship, National ID, Driving Licence, or Passport) plus a live selfie. An automated pipeline runs OCR to read the document, a face match between your selfie and the ID photo, and a forgery/tamper check. The result is reviewed and your KYC status becomes one of: PENDING, VERIFIED, REJECTED, or NEEDS_INFO. If rejected or if more information is requested, you can re-upload corrected documents. Verified providers get a verification badge and rank higher in search.`,
  },
  {
    category: 'provider_info',
    lang: 'ne',
    title: 'प्रदायकको KYC पहिचान प्रमाणीकरण',
    content: `बुकिङ लिनुअघि प्रदायकले KYC प्रमाणीकरण पूरा गर्नुपर्छ। तपाईंले सरकारी परिचयपत्र (नागरिकता, राष्ट्रिय परिचयपत्र, सवारी चालक अनुमतिपत्र वा राहदानी) र सेल्फी अपलोड गर्नुहोस्। स्वचालित प्रणालीले कागजात पढ्ने (OCR), सेल्फी र परिचयपत्रको फोटो मिलाउने (face match), र नक्कली जाँच गर्छ। स्थिति PENDING, VERIFIED, REJECTED वा NEEDS_INFO हुन्छ। अस्वीकृत भए वा थप जानकारी मागिए सच्याएर पुनः अपलोड गर्न सकिन्छ।`,
  },
  {
    category: 'provider_info',
    lang: 'en',
    title: 'What documents are accepted for KYC and how are they protected',
    content: `Accepted KYC documents are a valid government-issued photo ID: Nepali Citizenship certificate, National ID card, Driving Licence, or Passport, together with a live selfie for the face match. Upload clear, uncropped photos where all text and the photo are readable. Your documents are stored securely, used only for identity verification, and are subject to a data-retention policy that removes raw KYC images after they are no longer needed. Only authorised reviewers can access them.`,
  },
  {
    category: 'provider_info',
    lang: 'en',
    title: 'Trust badges and skill verification',
    content: `Beyond the automatic trust score, providers can earn badges that customers see on their profile. Milestone badges are awarded automatically as completed bookings pass thresholds. Verified skill and trust badges require submitting supporting evidence (for example a licence or certificate); an admin reviews the document and approves or rejects it. Some badges are purchasable and still require verification before they appear as ACTIVE. Badges help customers quickly identify experienced, verified professionals.`,
  },

  // ─────────────────────────────────────────────────────────────
  // CREDITS
  // ─────────────────────────────────────────────────────────────
  {
    category: 'credits',
    lang: 'en',
    title: 'Credits and visibility boost for providers',
    content: `Providers have a credit wallet showing current balance, total earned, and total spent. Credits are used to boost visibility — for example promoting your profile higher in relevant search results for a period. You top up by purchasing a credit pack and paying via a supported gateway (Khalti or eSewa). Every purchase and spend is recorded in your credit history. Credits improve exposure but never replace trust: ranking still weighs your trust score, verification, and reviews.`,
  },
  {
    category: 'credits',
    lang: 'ne',
    title: 'क्रेडिट र भिजिबिलिटी बुस्ट',
    content: `प्रदायकसँग क्रेडिट वालेट हुन्छ जसले हालको ब्यालेन्स, कुल कमाएको र कुल खर्च देखाउँछ। क्रेडिट प्रयोग गरेर भिजिबिलिटी बुस्ट गर्न सकिन्छ — जस्तै खोज परिणाममा केही समयका लागि प्रोफाइल माथि देखाउने। क्रेडिट प्याक किनेर Khalti वा eSewa मार्फत भुक्तानी गर्नुहोस्। हरेक किनमेल र खर्च क्रेडिट इतिहासमा रेकर्ड हुन्छ। क्रेडिटले देखिने अवसर बढाउँछ तर ट्रस्ट स्कोर, प्रमाणीकरण र समीक्षाको ठाउँ लिँदैन।`,
  },

  // ─────────────────────────────────────────────────────────────
  // POLICY — payments, disputes, guarantee, safety
  // ─────────────────────────────────────────────────────────────
  {
    category: 'policy',
    lang: 'en',
    title: 'Escrow payment protection',
    content: `Payments on BishwasSetu are protected by escrow. When you pay for a booking (via Khalti or eSewa), the money is held safely by the platform rather than going straight to the provider. It is released to the provider only after the job is marked complete. The platform deducts a small commission from the released amount as its service fee. If something goes wrong before release, the escrow can be refunded according to the refund and dispute policy. This protects both sides: customers don't pay for undelivered work, and providers are guaranteed payment for completed work.`,
  },
  {
    category: 'policy',
    lang: 'ne',
    title: 'एस्क्रो भुक्तानी सुरक्षा',
    content: `बिश्वाससेतुमा भुक्तानी एस्क्रोद्वारा सुरक्षित हुन्छ। तपाईंले बुकिङको भुक्तानी (Khalti वा eSewa) गर्दा रकम सिधै प्रदायकलाई नगई प्लेटफर्मले सुरक्षित राख्छ। काम सम्पन्न भएको चिन्ह लागेपछि मात्र प्रदायकलाई दिइन्छ। प्लेटफर्मले सानो कमिसन सेवा शुल्कका रूपमा लिन्छ। रिलिज हुनुअघि समस्या भए रिफन्ड नीतिअनुसार फिर्ता हुन सक्छ।`,
  },
  {
    category: 'policy',
    lang: 'en',
    title: 'Work guarantee and claims',
    content: `Eligible completed bookings come with a work guarantee valid for a limited period after the job. If the work fails or is defective within the guarantee window, you can file a guarantee claim from your guarantees list, describing the problem and attaching photos. The claim is reviewed and, if valid, resolved through repair, redo, or refund per policy. The guarantee gives customers peace of mind that verified providers stand behind their work.`,
  },
  {
    category: 'policy',
    lang: 'en',
    title: 'Filing a complaint or dispute',
    content: `If you have an issue with a booking — poor work, no-show, overcharging, or behaviour — file a complaint from the booking, choosing the complaint type and describing what happened. The system auto-categorises it and routes it for review; you can track its status and any resolution. For payment disputes, escrow protection means funds can be held or refunded while the case is reviewed. The assistant cannot resolve complaints itself, but it can explain the process and current status.`,
  },
  {
    category: 'policy',
    lang: 'ne',
    title: 'गुनासो वा विवाद दर्ता गर्ने',
    content: `बुकिङसम्बन्धी समस्या — कमसल काम, नआउने, बढी शुल्क वा व्यवहार भए बुकिङबाट गुनासो दर्ता गर्नुहोस्, प्रकार छान्नुहोस् र के भयो लेख्नुहोस्। प्रणालीले स्वतः वर्गीकरण गरी समीक्षाका लागि पठाउँछ; तपाईंले स्थिति र समाधान ट्र्याक गर्न सक्नुहुन्छ। भुक्तानी विवादमा एस्क्रोले रकम रोक्न वा फिर्ता गर्न सक्छ। सहायकले गुनासो आफैँ समाधान गर्न सक्दैन तर प्रक्रिया बुझाउन सक्छ।`,
  },
  {
    category: 'policy',
    lang: 'en',
    title: 'Safety, privacy, and staying on-platform',
    content: `For your protection, keep bookings, chat, and payments on BishwasSetu. On-platform escrow, the work guarantee, and dispute support only apply to jobs booked and paid through the platform — moving off-platform (paying cash directly or arranging privately) removes these protections. Never share passwords or one-time codes. Providers' identities are KYC-verified, and personal contact details are protected. If anyone pressures you to pay outside the platform, report it through a complaint.`,
  },
]

// ── Seeder ────────────────────────────────────────────────────

export async function seedKbArticles(prisma: PrismaClient): Promise<number> {
  // Idempotent: clear existing KB then insert the current canonical set.
  await prisma.kbArticle.deleteMany({})
  await prisma.kbArticle.createMany({ data: KB_ARTICLES })
  return KB_ARTICLES.length
}

// ── Standalone runner ─────────────────────────────────────────

async function main() {
  const prisma = new PrismaClient()
  try {
    console.log('🌱 Seeding knowledge base articles...')
    const count = await seedKbArticles(prisma)
    console.log(`✅ Seeded ${count} kb_articles (`
      + `${KB_ARTICLES.filter((a) => a.lang === 'en').length} EN, `
      + `${KB_ARTICLES.filter((a) => a.lang === 'ne').length} NE).`)
    console.log('ℹ️  Ensure AI_ASSISTANT_ENABLED=true and the FULLTEXT index exists for retrieval.')
  } finally {
    await prisma.$disconnect()
  }
}

// Only run when executed directly (not when imported by the main seed).
if (process.argv[1] && process.argv[1].includes('seedKb')) {
  main().catch((e) => {
    console.error('❌ KB seed failed:', e)
    process.exit(1)
  })
}
