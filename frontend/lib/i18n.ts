// Static UI-string dictionary for the EN/NE language toggle (context/language-context.tsx).
// Separate from that context's `t(en, ne)` helper, which picks between two
// values already supplied by the backend (e.g. Category.name/nameNp) — this
// dictionary is for strings that live only in the frontend: nav labels,
// headings, buttons, placeholders, validation messages.
//
// Keys are dot-namespaced by area (nav.*, footer.*, home.*, booking.*, …) so
// it's easy to find where a string is used. Extend this file as more of the
// site is translated — components read it via `tr(key)` from useLang().

export const STRINGS = {
  // ── Common ──────────────────────────────────────────────
  "common.search": { en: "Search", ne: "खोज्नुहोस्" },
  "common.back": { en: "Back", ne: "पछाडि" },
  "common.continue": { en: "Continue", ne: "अगाडि बढ्नुहोस्" },
  "common.loading": { en: "Loading…", ne: "लोड हुँदैछ…" },
  "common.processing": { en: "Processing…", ne: "प्रशोधन हुँदैछ…" },

  // ── Header / nav ────────────────────────────────────────
  "nav.services": { en: "Services", ne: "सेवाहरू" },
  "nav.howItWorks": { en: "How it works", ne: "कसरी काम गर्छ" },
  "nav.becomeAPro": { en: "Become a Pro", ne: "प्रोफेशनल बन्नुहोस्" },
  "nav.location": { en: "Kathmandu", ne: "काठमाडौं" },
  "nav.login": { en: "Log in", ne: "लग इन" },
  "nav.signup": { en: "Sign up", ne: "साइन अप" },
  "nav.logout": { en: "Log out", ne: "लग आउट" },
  "nav.notifications": { en: "Notifications", ne: "सूचनाहरू" },
  "nav.menu": { en: "Menu", ne: "मेनु" },
  "nav.toggleLanguage": { en: "Toggle language", ne: "भाषा बदल्नुहोस्" },

  // ── Footer ──────────────────────────────────────────────
  "footer.tagline": {
    en: "Trust infrastructure for Nepal's home services economy. Verified providers, escrow-protected payments.",
    ne: "नेपालको घरायसी सेवा अर्थतन्त्रका लागि विश्वासको पूर्वाधार। प्रमाणित सेवा प्रदायक, एस्क्रो-सुरक्षित भुक्तानी।",
  },
  "footer.escrowProtected": { en: "Escrow-protected", ne: "एस्क्रो-सुरक्षित" },
  "footer.customers": { en: "Customers", ne: "ग्राहकहरू" },
  "footer.browseServices": { en: "Browse services", ne: "सेवाहरू हेर्नुहोस्" },
  "footer.emergencyDispatch": { en: "Emergency dispatch", ne: "आपतकालीन सेवा" },
  "footer.myBookings": { en: "My bookings", ne: "मेरो बुकिङहरू" },
  "footer.providers": { en: "Providers", ne: "सेवा प्रदायकहरू" },
  "footer.providerSignup": { en: "Provider sign-up", ne: "प्रदायक साइन-अप" },
  "footer.kycVerification": { en: "KYC verification", ne: "केवाईसी प्रमाणीकरण" },
  "footer.company": { en: "Company", ne: "कम्पनी" },
  "footer.about": { en: "About", ne: "हाम्रोबारे" },
  "footer.trustSafety": { en: "Trust & Safety", ne: "विश्वास र सुरक्षा" },
  "footer.guarantee": { en: "Guarantee", ne: "ग्यारेन्टी" },
  "footer.rights": {
    en: "BishwasSetu Nepal. All rights reserved.",
    ne: "बिश्वासेतु नेपाल। सर्वाधिकार सुरक्षित।",
  },
  "footer.madeInNepal": { en: "Made in Nepal", ne: "नेपालमा निर्मित" },

  // ── Homepage hero ───────────────────────────────────────
  "home.hero.badge": { en: "Nepal's most trusted marketplace", ne: "नेपालको सबैभन्दा विश्वसनीय बजार" },
  "home.hero.title": {
    en: "Hire verified local professionals with total confidence",
    ne: "पूर्ण विश्वासका साथ प्रमाणित स्थानीय पेशेवरहरू भाडामा लिनुहोस्",
  },
  "home.hero.subtitle": {
    en: "Every provider on BishwasSetu passes a 4-stage identity, skill and reference check. Book in minutes — backed by escrow and a service guarantee.",
    ne: "बिश्वासेतुका सबै सेवा प्रदायकले ४-चरणको परिचय, सीप र सन्दर्भ जाँच पास गर्छन्। मिनेटमै बुक गर्नुहोस् — एस्क्रो र सेवा ग्यारेन्टीको सुरक्षासहित।",
  },
  "home.hero.popular": { en: "Popular:", ne: "लोकप्रिय:" },
  "home.hero.aiSmartMatch": { en: "AI Smart Match", ne: "एआई स्मार्ट म्याच" },
  "home.hero.emergencyCta": { en: "Find Me a Pro Now", ne: "अहिले नै प्रो खोज्नुहोस्" },
  "home.hero.trust1": { en: "4-stage verification", ne: "४-चरण प्रमाणीकरण" },
  "home.hero.trust2": { en: "Escrow-protected payments", ne: "एस्क्रो-सुरक्षित भुक्तानी" },
  "home.hero.trust3": { en: "24/7 incident support", ne: "२४/७ घटना सहयोग" },
  "home.hero.trust4": { en: "Damage cover up to NPR 1L", ne: "रु. १ लाखसम्मको क्षति कभर" },

  // ── Homepage hero preview card (illustrative mock) ──────
  "home.preview.responseTime": { en: "Response time", ne: "प्रतिक्रिया समय" },
  "home.preview.bookingConfirmed": { en: "Booking confirmed", ne: "बुकिङ पुष्टि भयो" },
  "home.preview.trustScore": { en: "Trust score", ne: "विश्वास स्कोर" },
  "home.preview.identityVerified": { en: "Identity verified", ne: "परिचय प्रमाणित" },
  "home.preview.skillTier": { en: "Skill Tier 2 Expert", ne: "सीप तह २ विशेषज्ञ" },
  "home.preview.jobsDone": { en: "412+ jobs", ne: "४१२+ काम" },
  "home.preview.rating": { en: "Rating", ne: "मूल्याङ्कन" },
  "home.preview.jobs": { en: "Jobs", ne: "कामहरू" },
  "home.preview.years": { en: "Years", ne: "वर्ष" },

  // ── Homepage categories / sections ──────────────────────
  "home.categories.heading": { en: "Browse by category", ne: "श्रेणी अनुसार हेर्नुहोस्" },
  "home.categories.subtitle": {
    en: "Every provider is identity-verified before they can take jobs.",
    ne: "काम लिनुअघि हरेक सेवा प्रदायकको परिचय प्रमाणित गरिन्छ।",
  },
  "home.categories.allServices": { en: "All services", ne: "सबै सेवाहरू" },

  // ── Search bar ──────────────────────────────────────────
  "search.whatLabel": { en: "What you need", ne: "तपाईंलाई के चाहिन्छ" },
  "search.whatPlaceholder": { en: "Electrician, plumber, tutor…", ne: "इलेक्ट्रिसियन, प्लम्बर, ट्युटर…" },
  "search.whereLabel": { en: "Where", ne: "कहाँ" },
  "search.wherePlaceholder": { en: "Your city or area", ne: "तपाईंको शहर वा क्षेत्र" },
  "search.ariaWhat": { en: "What service do you need", ne: "तपाईंलाई कस्तो सेवा चाहिन्छ" },
  "search.ariaWhere": { en: "Where do you need it", ne: "तपाईंलाई कहाँ चाहिन्छ" },

  // ── Booking flow ────────────────────────────────────────
  "booking.stepCounter": { en: "Step {current} of {total}", ne: "चरण {current} / {total}" },
  "booking.step.service": { en: "Service", ne: "सेवा" },
  "booking.step.schedule": { en: "Schedule", ne: "समय तालिका" },
  "booking.step.review": { en: "Review", ne: "समीक्षा" },
  "booking.step.pay": { en: "Pay", ne: "भुक्तानी" },
  "booking.progressLabel": { en: "Booking progress", ne: "बुकिङ प्रगति" },
  "booking.stepDone": { en: "completed", ne: "पूरा भयो" },
  "booking.bookingWith": { en: "Booking with", ne: "सँग बुकिङ" },
  "booking.trustScore": { en: "Trust {score}", ne: "विश्वास {score}" },
  "booking.jobsDone": { en: "{count} jobs done", ne: "{count} काम सम्पन्न" },
  "booking.edit": { en: "Edit", ne: "सम्पादन" },
  "booking.optional": { en: "Optional", ne: "वैकल्पिक" },
  "booking.errorSummary": {
    en: "Check the highlighted fields before you continue.",
    ne: "अगाडि बढ्नुअघि देखाइएका ठाउँहरू जाँच्नुहोस्।",
  },

  "booking.step0.heading": { en: "What do you need done?", ne: "तपाईंलाई के काम गराउनु छ?" },
  "booking.step0.serviceLabel": { en: "Service", ne: "सेवा" },
  "booking.step0.generalService": { en: "General service booking.", ne: "सामान्य सेवा बुकिङ।" },
  "booking.step0.describeLabel": { en: "Describe the job", ne: "काम वर्णन गर्नुहोस्" },
  "booking.step0.describePlaceholder": {
    en: "e.g. Kitchen tap has been dripping for a week and the pipe under the sink is leaking.",
    ne: "जस्तै: भान्साको धारा एक हप्तादेखि चुहिरहेको छ र सिंकमुनिको पाइप पनि चुहिँदैछ।",
  },
  "booking.step0.errChooseService": { en: "Choose a service.", ne: "सेवा छान्नुहोस्।" },
  "booking.step0.errDescribe": {
    en: "Describe the job in at least 10 characters.",
    ne: "कामलाई कम्तिमा १० अक्षरमा वर्णन गर्नुहोस्।",
  },
  "booking.step0.errDescribeMax": {
    en: "Keep the description under 1,000 characters.",
    ne: "वर्णन १,००० अक्षरभित्र राख्नुहोस्।",
  },
  "booking.step0.serviceHint": {
    en: "Pick the closest match — the pro can adjust on site.",
    ne: "नजिकको मिल्ने छान्नुहोस् — प्रोले स्थलमै मिलाउन सक्छन्।",
  },
  "booking.step0.describeHint": {
    en: "The more specific you are, the more accurate the price and the fewer follow-up questions.",
    ne: "जति स्पष्ट लेख्नुहुन्छ, मूल्य त्यति सही हुन्छ र थप प्रश्न कम आउँछन्।",
  },
  "booking.step0.charCount": { en: "{count} / 1,000", ne: "{count} / १,०००" },

  "booking.step1.heading": { en: "When & where?", ne: "कहिले र कहाँ?" },
  "booking.step1.dateLabel": { en: "Date", ne: "मिति" },
  "booking.step1.timeLabel": { en: "Time", ne: "समय" },
  "booking.step1.addressLabel": { en: "Service address", ne: "सेवा ठेगाना" },
  "booking.step1.addressPlaceholder": {
    en: "Maharajgunj, Kathmandu — house / landmark",
    ne: "महाराजगंज, काठमाडौं — घर / ल्यान्डमार्क",
  },
  "booking.step1.manageAddresses": { en: "Manage saved addresses", ne: "सुरक्षित ठेगानाहरू व्यवस्थापन गर्नुहोस्" },
  "booking.step1.errDateTime": { en: "Pick a date and time.", ne: "मिति र समय छान्नुहोस्।" },
  "booking.step1.errFutureTime": { en: "Choose a time in the future.", ne: "भविष्यको समय छान्नुहोस्।" },
  "booking.step1.errAddress": { en: "Enter the service address.", ne: "सेवा ठेगाना प्रविष्ट गर्नुहोस्।" },
  "booking.step1.today": { en: "Today", ne: "आज" },
  "booking.step1.tomorrow": { en: "Tomorrow", ne: "भोलि" },
  "booking.step1.otherDate": { en: "Another date", ne: "अर्को मिति" },
  "booking.step1.morning": { en: "Morning", ne: "बिहान" },
  "booking.step1.afternoon": { en: "Afternoon", ne: "दिउँसो" },
  "booking.step1.evening": { en: "Evening", ne: "साँझ" },
  "booking.step1.pickDateFirst": {
    en: "Pick a date to see available times.",
    ne: "उपलब्ध समय हेर्न पहिले मिति छान्नुहोस्।",
  },
  "booking.step1.noSlotsToday": {
    en: "No slots left today — try tomorrow.",
    ne: "आज कुनै समय बाँकी छैन — भोलि हेर्नुहोस्।",
  },
  "booking.step1.arrivalNote": {
    en: "Arrival window, not an exact minute — the pro confirms before setting out.",
    ne: "यो आगमनको समय दायरा हो, ठ्याक्कै मिनेट होइन — प्रो हिँड्नुअघि पुष्टि गर्छन्।",
  },
  "booking.step1.savedAddresses": { en: "Saved addresses", ne: "सुरक्षित ठेगानाहरू" },
  "booking.step1.default": { en: "Default", ne: "पूर्वनिर्धारित" },
  "booking.step1.otherAddress": { en: "A different address", ne: "अर्को ठेगाना" },
  "booking.step1.addressHint": {
    en: "Add a landmark — it saves the pro a phone call.",
    ne: "ल्यान्डमार्क थप्नुहोस् — प्रोलाई फोन गर्नु पर्दैन।",
  },

  "booking.step2.heading": { en: "Estimate & escrow", ne: "अनुमान र एस्क्रो" },
  "booking.step2.priceLabel": { en: "Agreed price (NPR)", ne: "सहमत मूल्य (रु.)" },
  "booking.step2.pricePlaceholder": { en: "e.g. 1500", ne: "जस्तै: १५००" },
  "booking.step2.noFeeNote": {
    en: "One all-inclusive price — no separate customer booking fee.",
    ne: "एउटै सम्पूर्ण मूल्य — छुट्टै ग्राहक बुकिङ शुल्क छैन।",
  },
  "booking.step2.errPrice": { en: "Enter an amount of at least NPR 100.", ne: "कम्तिमा रु. १०० रकम प्रविष्ट गर्नुहोस्।" },
  "booking.step2.errPriceMax": {
    en: "Enter an amount under NPR 500,000.",
    ne: "रु. ५,००,००० भन्दा कम रकम प्रविष्ट गर्नुहोस्।",
  },
  "booking.step2.youPay": { en: "You pay", ne: "तपाईंले तिर्ने" },
  "booking.step2.priceHint": {
    en: "The amount you and the pro agreed on for this job.",
    ne: "यो कामका लागि तपाईं र प्रोबीच सहमत भएको रकम।",
  },
  "booking.step2.commonAmounts": { en: "Common amounts", ne: "प्रचलित रकम" },
  "booking.step2.allInclusive": {
    en: "All-inclusive. This is the full amount you pay — nothing is added later.",
    ne: "सबै समावेश। तपाईंले तिर्ने पूरा रकम यही हो — पछि केही थपिँदैन।",
  },
  "booking.step2.tierLimit": {
    en: "{name} is a Tier 1 · Basic pro and can take jobs under NPR 1,000. Lower the amount, or book a Tier 2+ pro for bigger jobs.",
    ne: "{name} टियर १ · बेसिक प्रो हुन् र रु. १,००० भन्दा कमका काम मात्र लिन सक्छन्। रकम घटाउनुहोस्, वा ठूला कामका लागि टियर २+ प्रो बुक गर्नुहोस्।",
  },
  "booking.step2.escrowExplainer": {
    en: "Your money is held safely by BishwasSetu. The provider is paid only when you confirm the job is done.",
    ne: "तपाईंको पैसा बिश्वासेतुले सुरक्षित राख्छ। काम सम्पन्न भएको पुष्टि गरेपछि मात्र प्रदायकले भुक्तानी पाउँछन्।",
  },
  "booking.step2.escrowHeld": { en: "Held safely", ne: "सुरक्षित राखिन्छ" },
  "booking.step2.escrowReleased": { en: "Released on completion", ne: "काम सकिएपछि जारी" },
  "booking.step2.guarantee": {
    en: "7-day workmanship guarantee on every escrow-paid job.",
    ne: "एस्क्रोबाट भुक्तानी भएका हरेक कामका लागि ७ दिने कारीगरी ग्यारेन्टी।",
  },
  "booking.step2.refund": {
    en: "Pro doesn't show up? Your money comes back — you never chase it.",
    ne: "प्रो आएनन् भने? तपाईंको पैसा फिर्ता आउँछ — पछि लाग्नु पर्दैन।",
  },

  "booking.step3.heading": { en: "Review & pay", ne: "समीक्षा र भुक्तानी" },
  "booking.step3.escrowChip": { en: "Escrow protected", ne: "एस्क्रो सुरक्षित" },
  "booking.step3.paymentMethodLabel": { en: "Payment method", ne: "भुक्तानी विधि" },
  "booking.step3.heldNote": {
    en: 'Held in escrow until you tap "Job Complete".',
    ne: "तपाईंले “काम सम्पन्न” थिच्नेबित्तिकै एस्क्रोमा राखिन्छ।",
  },
  "booking.step3.pay": { en: "Pay {amount}", ne: "{amount} तिर्नुहोस्" },
  "booking.step3.summaryTitle": { en: "Your booking", ne: "तपाईंको बुकिङ" },
  "booking.step3.rowService": { en: "Service", ne: "सेवा" },
  "booking.step3.rowWhen": { en: "When", ne: "कहिले" },
  "booking.step3.rowWhere": { en: "Where", ne: "कहाँ" },
  "booking.step3.rowJob": { en: "Job details", ne: "कामको विवरण" },
  "booking.step3.total": { en: "Total to pay", ne: "तिर्नुपर्ने जम्मा" },
  "booking.step3.redirectNote": {
    en: "You'll be taken to {wallet} to complete the payment, then straight back here.",
    ne: "भुक्तानी पूरा गर्न तपाईंलाई {wallet} मा लगिनेछ, त्यसपछि सिधै यहीँ फर्काइनेछ।",
  },

  "booking.notAvailable": { en: "This provider isn't available.", ne: "यो सेवा प्रदायक उपलब्ध छैन।" },
  "booking.browseServices": { en: "Browse services", ne: "सेवाहरू हेर्नुहोस्" },
  "booking.createdSuccess": {
    en: "Booking created — payment held in escrow.",
    ne: "बुकिङ सिर्जना भयो — भुक्तानी एस्क्रोमा राखियो।",
  },
  "booking.createdFailed": { en: "Couldn't create the booking.", ne: "बुकिङ सिर्जना गर्न सकिएन।" },

  // ── AI assistant widget ─────────────────────────────────
  "assistant.title": { en: "Setu Assistant", ne: "सेतु सहायक" },
  "assistant.subtitle": { en: "Ask about bookings, trust & safety", ne: "बुकिङ, विश्वास र सुरक्षाबारे सोध्नुहोस्" },
  "assistant.open": { en: "Open assistant", ne: "सहायक खोल्नुहोस्" },
  "assistant.close": { en: "Close", ne: "बन्द गर्नुहोस्" },
  "assistant.greeting": { en: "How can I help?", ne: "म कसरी मद्दत गर्न सक्छु?" },
  "assistant.greetingSubtitle": {
    en: "I can explain how BishwasSetu works — in English or नेपाली.",
    ne: "बिश्वासेतु कसरी काम गर्छ भनेर म बताउन सक्छु — नेपाली वा अंग्रेजीमा।",
  },
  "assistant.signInHint": { en: "Sign in for help with your own bookings.", ne: "आफ्नो बुकिङबारे मद्दतका लागि साइन इन गर्नुहोस्।" },
  "assistant.inputPlaceholder": { en: "Type your question…", ne: "आफ्नो प्रश्न लेख्नुहोस्…" },
  "assistant.send": { en: "Send", ne: "पठाउनुहोस्" },
  "assistant.message": { en: "Message", ne: "सन्देश" },
  "assistant.newChat": { en: "New chat", ne: "नयाँ कुराकानी" },
  "assistant.feedbackUp": { en: "Helpful", ne: "उपयोगी" },
  "assistant.feedbackDown": { en: "Not helpful", ne: "उपयोगी छैन" },

  "assistant.guest1": { en: "What is BishwasSetu?", ne: "बिश्वासेतु के हो?" },
  "assistant.guest2": { en: "How does it work?", ne: "यसले कसरी काम गर्छ?" },
  "assistant.guest3": { en: "Is my payment safe?", ne: "के मेरो भुक्तानी सुरक्षित छ?" },
  "assistant.customer1": { en: "How does escrow protect me?", ne: "एस्क्रोले मलाई कसरी सुरक्षा दिन्छ?" },
  "assistant.customer2": { en: "What is a trust score?", ne: "विश्वास स्कोर के हो?" },
  "assistant.customer3": { en: "How do I file a complaint?", ne: "म कसरी उजुरी दर्ता गर्न सक्छु?" },
  "assistant.provider1": { en: "What's my trust score?", ne: "मेरो विश्वास स्कोर कति छ?" },
  "assistant.provider2": { en: "How do credits work?", ne: "क्रेडिटले कसरी काम गर्छ?" },
  "assistant.provider3": { en: "How do I get verified?", ne: "म कसरी प्रमाणित हुन सक्छु?" },

  // ── Emergency dispatch ("Find Me a Pro Now") ────────────
  "emergency.title": { en: "Emergency Dispatch", ne: "आपतकालीन सेवा" },
  "emergency.subtitle": {
    en: "Nearest verified pro · 12% priority fee · Tier 2+ only",
    ne: "नजिकको प्रमाणित प्रो · १२% प्राथमिकता शुल्क · टियर २+ मात्र",
  },
  "emergency.back": { en: "Back", ne: "पछाडि" },

  "emergency.category.plumbing": { en: "Plumbing", ne: "प्लम्बिङ" },
  "emergency.category.electrical": { en: "Electrical", ne: "बिजुली" },
  "emergency.category.acCooling": { en: "AC / Cooling", ne: "एसी / कुलिङ" },
  "emergency.category.applianceRepair": { en: "Appliance", ne: "उपकरण मर्मत" },
  "emergency.category.cleaning": { en: "Cleaning", ne: "सरसफाई" },
  "emergency.category.carpentry": { en: "Carpentry", ne: "काठको काम" },

  "emergency.stage1.heading": { en: "What's the emergency?", ne: "आपतकालीन समस्या के हो?" },
  "emergency.stage1.note": {
    en: "Only Tier 2+ verified providers · 12% emergency fee applies",
    ne: "टियर २+ प्रमाणित प्रदायक मात्र · १२% आपतकालीन शुल्क लाग्छ",
  },

  "emergency.stage2.banner": {
    en: "⚡ Emergency mode — a 12% priority fee is added. Providers who accept within 5 min earn a Fast Responder badge.",
    ne: "⚡ आपतकालीन मोड — १२% प्राथमिकता शुल्क थपिन्छ। ५ मिनेटभित्र स्वीकार गर्ने प्रदायकले फास्ट रेस्पोन्डर ब्याज पाउँछन्।",
  },
  "emergency.stage2.heading": { en: "Confirm your location", ne: "आफ्नो स्थान पुष्टि गर्नुहोस्" },
  "emergency.stage2.addressLabel": { en: "Service address", ne: "सेवा ठेगाना" },
  "emergency.stage2.addressPlaceholder": {
    en: "Area / landmark (e.g. Maharajgunj, near the chowk)",
    ne: "क्षेत्र / ल्यान्डमार्क (जस्तै: महाराजगंज, चोक नजिक)",
  },
  "emergency.stage2.locationShared": { en: "Location shared", ne: "स्थान साझा गरियो" },
  "emergency.stage2.gettingLocation": { en: "Getting location…", ne: "स्थान लिँदैछ…" },
  "emergency.stage2.shareLocation": { en: "Share my current location", ne: "मेरो हालको स्थान साझा गर्नुहोस्" },
  "emergency.stage2.gpsNote": {
    en: "We use your GPS to dispatch the nearest verified pro.",
    ne: "नजिकको प्रमाणित प्रो पठाउन हामी तपाईंको GPS प्रयोग गर्छौं।",
  },
  "emergency.stage2.describeLabel": { en: "Describe the problem (optional)", ne: "समस्या वर्णन गर्नुहोस् (वैकल्पिक)" },
  "emergency.stage2.describePlaceholder": {
    en: "e.g. Water pipe burst in bathroom, need urgent fix",
    ne: "जस्तै: बाथरूमको पाइप फुट्यो, तुरुन्त मर्मत चाहियो",
  },
  "emergency.stage2.findProNow": { en: "Find me a pro now", ne: "अहिले नै प्रो खोज्नुहोस्" },
  "emergency.stage2.dispatching": { en: "Dispatching…", ne: "पठाउँदैछ…" },
  "emergency.stage2.shareToDispatch": {
    en: "Share your location above to dispatch.",
    ne: "पठाउन माथि आफ्नो स्थान साझा गर्नुहोस्।",
  },

  "emergency.stage3.finding": { en: "Finding your nearest verified pro…", ne: "तपाईंको नजिकको प्रमाणित प्रो खोज्दैछ…" },
  "emergency.stage3.searchWindow": { en: "Searching within 10km · up to 10 min", ne: "१० किमीभित्र खोजी · १० मिनेटसम्म" },
  "emergency.stage3.scanning": { en: "Scanning area…", ne: "क्षेत्र स्क्यान गर्दैछ…" },
  "emergency.stage3.providersNotified": { en: "{count} providers notified", ne: "{count} प्रदायकलाई सूचित गरियो" },
  "emergency.stage3.cancel": { en: "Cancel request", ne: "अनुरोध रद्द गर्नुहोस्" },

  "emergency.stage4.title": { en: "Pro on the way! 🎉", ne: "प्रो आउँदैछन्! 🎉" },
  "emergency.stage4.body": {
    en: "A verified provider has accepted your emergency request and is heading your way. You'll receive an SMS confirmation shortly.",
    ne: "एक प्रमाणित प्रदायकले तपाईंको आपतकालीन अनुरोध स्वीकार गरेका छन् र तपाईंतर्फ आउँदैछन्। चाँडै तपाईंलाई SMS पुष्टि आउनेछ।",
  },
  "emergency.stage4.viewBooking": { en: "View booking details", ne: "बुकिङ विवरण हेर्नुहोस्" },
  "emergency.stage4.goToBookings": { en: "Go to my bookings", ne: "मेरो बुकिङहरूमा जानुहोस्" },

  "emergency.stage5.title": { en: "No pros available right now", ne: "अहिले कुनै प्रो उपलब्ध छैनन्" },
  "emergency.stage5.body": {
    en: "We've queued your request and will SMS you the moment a verified provider accepts. No charge until one is on the way.",
    ne: "हामीले तपाईंको अनुरोध लाइनमा राखेका छौं र प्रमाणित प्रदायकले स्वीकार गर्नेबित्तिकै SMS पठाउनेछौं। प्रो नआएसम्म कुनै शुल्क लाग्दैन।",
  },
  "emergency.stage5.browseInstead": { en: "Browse scheduled bookings instead", ne: "बरु तालिकाबद्ध बुकिङहरू हेर्नुहोस्" },
  "emergency.stage5.tryAgain": { en: "Try again", ne: "फेरि प्रयास गर्नुहोस्" },

  "emergency.toast.noLocationSupport": {
    en: "Location isn't available on this device.",
    ne: "यो यन्त्रमा स्थान सेवा उपलब्ध छैन।",
  },
  "emergency.toast.locationCaptured": { en: "Location captured.", ne: "स्थान लिइयो।" },
  "emergency.toast.locationFailed": {
    en: "Couldn't get your location — allow access and try again.",
    ne: "तपाईंको स्थान लिन सकिएन — पहुँच दिनुहोस् र फेरि प्रयास गर्नुहोस्।",
  },
  "emergency.toast.needLocation": {
    en: "Share your location so we can find the nearest pro.",
    ne: "नजिकको प्रो खोज्न आफ्नो स्थान साझा गर्नुहोस्।",
  },
  "emergency.toast.dispatchFailed": { en: "Could not dispatch. Try again.", ne: "पठाउन सकिएन। फेरि प्रयास गर्नुहोस्।" },

  // ── Auth — shared ────────────────────────────────────────
  "auth.bridgeOfTrust": { en: "Bridge of Trust", ne: "विश्वासको पुल" },
  "auth.continueWithGoogle": { en: "Continue with Google", ne: "गुगलमार्फत जारी राख्नुहोस्" },
  "auth.footerTagline": { en: "Nepal's trusted home services platform", ne: "नेपालको भरपर्दो घरायसी सेवा प्लेटफर्म" },
  "auth.orContinueWith": { en: "Or continue with", ne: "वा यसद्वारा जारी राख्नुहोस्" },
  "auth.orRegisterWith": { en: "Or register with", ne: "वा यसद्वारा दर्ता गर्नुहोस्" },

  // ── Auth — login ─────────────────────────────────────────
  "auth.login.welcomeBack": { en: "Welcome Back", ne: "फेरि स्वागत छ" },
  "auth.login.subtitle": { en: "Sign in to your account", ne: "आफ्नो खातामा साइन इन गर्नुहोस्" },
  "auth.login.emailAddressLabel": { en: "Email Address", ne: "इमेल ठेगाना" },
  "auth.login.emailPlaceholder": { en: "Enter your email", ne: "आफ्नो इमेल प्रविष्ट गर्नुहोस्" },
  "auth.login.passwordLabel": { en: "Password", ne: "पासवर्ड" },
  "auth.login.passwordPlaceholder": { en: "Enter your password", ne: "आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्" },
  "auth.login.errFields": { en: "Enter your email/phone and password.", ne: "आफ्नो इमेल/फोन र पासवर्ड प्रविष्ट गर्नुहोस्।" },
  "auth.login.signIn": { en: "Sign In", ne: "साइन इन" },
  "auth.login.sendingCode": { en: "Sending code…", ne: "कोड पठाउँदैछ…" },
  "auth.login.forgotPassword": { en: "Forgot your password?", ne: "पासवर्ड बिर्सनुभयो?" },
  "auth.login.noAccount": { en: "Don't have an account?", ne: "खाता छैन?" },
  "auth.login.createAccount": { en: "Create Account", ne: "खाता खोल्नुहोस्" },
  "auth.login.toastOtpSent": { en: "Enter the code we just sent you.", ne: "हामीले भर्खरै पठाएको कोड प्रविष्ट गर्नुहोस्।" },
  "auth.login.errFailed": { en: "Login failed.", ne: "लग इन असफल भयो।" },

  // ── Auth — register ──────────────────────────────────────
  "auth.register.heading": { en: "Create Account", ne: "खाता खोल्नुहोस्" },
  "auth.register.subtitle": { en: "Join Nepal's trusted home services platform", ne: "नेपालको भरपर्दो घरायसी सेवा प्लेटफर्ममा सामेल हुनुहोस्" },
  "auth.register.needService": { en: "Need a service", ne: "सेवा चाहियो" },
  "auth.register.imProvider": { en: "I'm a provider", ne: "म प्रदायक हुँ" },
  "auth.register.fullName": { en: "Full Name", ne: "पूरा नाम" },
  "auth.register.fullNamePlaceholder": { en: "Ram Bahadur Thapa", ne: "राम बहादुर थापा" },
  "auth.register.phoneNumber": { en: "Phone Number", ne: "फोन नम्बर" },
  "auth.register.emailLabel": { en: "Email", ne: "इमेल" },
  "auth.register.optional": { en: "(optional)", ne: "(वैकल्पिक)" },
  "auth.register.password": { en: "Password", ne: "पासवर्ड" },
  "auth.register.passwordPlaceholder": { en: "At least 8 characters", ne: "कम्तिमा ८ अक्षर" },
  "auth.register.whereServiceCustomer": { en: "Where do you need service?", ne: "तपाईंलाई कहाँ सेवा चाहिन्छ?" },
  "auth.register.whereServiceProvider": { en: "Where do you work?", ne: "तपाईं कहाँ काम गर्नुहुन्छ?" },
  "auth.register.district": { en: "District", ne: "जिल्ला" },
  "auth.register.districtPlaceholder": { en: "Kathmandu", ne: "काठमाडौं" },
  "auth.register.city": { en: "City / Town", ne: "शहर / नगर" },
  "auth.register.cityPlaceholder": { en: "Maharajgunj", ne: "महाराजगंज" },
  "auth.register.locationCaptured": { en: "Location captured ✓", ne: "स्थान लिइयो ✓" },
  "auth.register.gettingLocation": { en: "Getting location…", ne: "स्थान लिँदैछ…" },
  "auth.register.useMyLocation": { en: "Use my current location", ne: "मेरो हालको स्थान प्रयोग गर्नुहोस्" },
  "auth.register.creating": { en: "Creating…", ne: "खाता खोल्दैछ…" },
  "auth.register.verifiedEscrow": { en: "Verified & escrow-protected", ne: "प्रमाणित र एस्क्रो-सुरक्षित" },
  "auth.register.alreadyHaveAccount": { en: "Already have an account?", ne: "पहिल्यै खाता छ?" },
  "auth.register.logIn": { en: "Log In", ne: "लग इन" },
  "auth.register.errName": { en: "Enter your full name.", ne: "आफ्नो पूरा नाम प्रविष्ट गर्नुहोस्।" },
  "auth.register.errEmailOrPhone": { en: "Provide an email or phone number.", ne: "इमेल वा फोन नम्बर प्रदान गर्नुहोस्।" },
  "auth.register.errEmailInvalid": { en: "Enter a valid email address.", ne: "मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।" },
  "auth.register.errPhoneInvalid": { en: "Enter a valid Nepal mobile number.", ne: "मान्य नेपाली मोबाइल नम्बर प्रविष्ट गर्नुहोस्।" },
  "auth.register.errPasswordLen": { en: "At least 8 characters.", ne: "कम्तिमा ८ अक्षर।" },
  "auth.register.errDistrict": { en: "Enter your district.", ne: "आफ्नो जिल्ला प्रविष्ट गर्नुहोस्।" },
  "auth.register.errCity": { en: "Enter your city / town.", ne: "आफ्नो शहर / नगर प्रविष्ट गर्नुहोस्।" },
  "auth.register.toastLocationUnavailable": { en: "Location isn't available on this device.", ne: "यो यन्त्रमा स्थान सेवा उपलब्ध छैन।" },
  "auth.register.toastLocationCaptured": { en: "Location captured — we'll match the nearest pros.", ne: "स्थान लिइयो — हामी नजिकका प्रोसँग मिलाउनेछौं।" },
  "auth.register.toastLocationFailed": { en: "Couldn't get your location. Enter your district instead.", ne: "स्थान लिन सकिएन। बरु आफ्नो जिल्ला प्रविष्ट गर्नुहोस्।" },
  "auth.register.toastAccountCreated": { en: "Account created — verify the code we sent you.", ne: "खाता खुल्यो — हामीले पठाएको कोड प्रमाणित गर्नुहोस्।" },
  "auth.register.errFailed": { en: "Registration failed.", ne: "दर्ता असफल भयो।" },

  // ── Auth — verify OTP ────────────────────────────────────
  "auth.verifyOtp.heading": { en: "Enter your code", ne: "आफ्नो कोड प्रविष्ट गर्नुहोस्" },
  "auth.verifyOtp.subtitle": { en: "We sent a 6-digit code to your {channel}.", ne: "हामीले तपाईंको {channel} मा ६ अंकको कोड पठायौं।" },
  "auth.verifyOtp.errCode": { en: "Enter the 6-digit code.", ne: "६ अंकको कोड प्रविष्ट गर्नुहोस्।" },
  "auth.verifyOtp.verify": { en: "Verify & continue", ne: "प्रमाणित गर्नुहोस् र अगाडि बढ्नुहोस्" },
  "auth.verifyOtp.verifying": { en: "Verifying…", ne: "प्रमाणित गर्दैछ…" },
  "auth.verifyOtp.toastVerified": { en: "Verified — you're logged in.", ne: "प्रमाणित भयो — तपाईं लग इन हुनुभयो।" },
  "auth.verifyOtp.errFailed": { en: "Verification failed.", ne: "प्रमाणीकरण असफल भयो।" },
  "auth.verifyOtp.didntGetIt": { en: "Didn't get it?", ne: "कोड आएन?" },
  "auth.verifyOtp.resendIn": { en: "Resend in {seconds}s", ne: "{seconds} सेकेन्डमा पुनः पठाउनुहोस्" },
  "auth.verifyOtp.resendCode": { en: "Resend code", ne: "कोड पुनः पठाउनुहोस्" },
  "auth.verifyOtp.sending": { en: "Sending…", ne: "पठाउँदैछ…" },
  "auth.verifyOtp.toastResent": { en: "A new code is on its way.", ne: "नयाँ कोड आउँदैछ।" },
  "auth.verifyOtp.errResendFailed": { en: "Couldn't resend. Try again shortly.", ne: "पुनः पठाउन सकिएन। केही बेरमा फेरि प्रयास गर्नुहोस्।" },

  // ── Auth — forgot password ───────────────────────────────
  "auth.forgotPassword.heading": { en: "Reset your password", ne: "आफ्नो पासवर्ड रिसेट गर्नुहोस्" },
  "auth.forgotPassword.subtitle": {
    en: "Enter the email or phone on your account and we'll send you a code.",
    ne: "आफ्नो खातामा भएको इमेल वा फोन प्रविष्ट गर्नुहोस्, हामी कोड पठाउनेछौं।",
  },
  "auth.forgotPassword.label": { en: "Email or phone", ne: "इमेल वा फोन" },
  "auth.forgotPassword.placeholder": { en: "you@example.com or 98XXXXXXXX", ne: "you@example.com वा ९८XXXXXXXX" },
  "auth.forgotPassword.errEmpty": { en: "Enter your email or phone number.", ne: "आफ्नो इमेल वा फोन नम्बर प्रविष्ट गर्नुहोस्।" },
  "auth.forgotPassword.send": { en: "Send reset code", ne: "रिसेट कोड पठाउनुहोस्" },
  "auth.forgotPassword.sending": { en: "Sending code…", ne: "कोड पठाउँदैछ…" },
  "auth.forgotPassword.toastSent": { en: "A reset code is on its way.", ne: "रिसेट कोड आउँदैछ।" },
  "auth.forgotPassword.errFailed": { en: "Couldn't send a reset code.", ne: "रिसेट कोड पठाउन सकिएन।" },
  "auth.forgotPassword.rememberedIt": { en: "Remembered it?", ne: "पासवर्ड सम्झनुभयो?" },
  "auth.forgotPassword.backToSignIn": { en: "Back to sign in", ne: "साइन इनमा फर्कनुहोस्" },

  // ── Auth — reset password ────────────────────────────────
  "auth.resetPassword.subtitle": {
    en: "We sent a 6-digit code to your {channel}. It expires shortly, so finish resetting your password now.",
    ne: "हामीले तपाईंको {channel} मा ६ अंकको कोड पठायौं। यो चाँडै समाप्त हुन्छ, अहिले नै पासवर्ड रिसेट गर्नुहोस्।",
  },
  "auth.resetPassword.newPasswordLabel": { en: "New password", ne: "नयाँ पासवर्ड" },
  "auth.resetPassword.confirmPasswordLabel": { en: "Confirm new password", ne: "नयाँ पासवर्ड पुष्टि गर्नुहोस्" },
  "auth.resetPassword.errPasswordLen": {
    en: "New password must be at least 8 characters.",
    ne: "नयाँ पासवर्ड कम्तिमा ८ अक्षरको हुनुपर्छ।",
  },
  "auth.resetPassword.errPasswordMismatch": {
    en: "New password and confirmation don't match.",
    ne: "नयाँ पासवर्ड र पुष्टि मिलेन।",
  },
  "auth.resetPassword.reset": { en: "Reset password", ne: "पासवर्ड रिसेट गर्नुहोस्" },
  "auth.resetPassword.resetting": { en: "Resetting…", ne: "रिसेट गर्दैछ…" },
  "auth.resetPassword.toastSuccess": { en: "Password reset. Please sign in.", ne: "पासवर्ड रिसेट भयो। कृपया साइन इन गर्नुहोस्।" },
  "auth.resetPassword.errFailed": { en: "Couldn't reset your password.", ne: "पासवर्ड रिसेट गर्न सकिएन।" },
} as const satisfies Record<string, { en: string; ne: string }>;

export type StringKey = keyof typeof STRINGS;
