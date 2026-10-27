// Comprehensive English and Tamil translations for AgriProcure
export const translations = {
  English: {
    brand: 'AgriProcure',
    tagline: 'National Agricultural Procurement System',
    headline: 'Streamlining harvest procurement through data-driven logistics.',
    govBanner: 'An official system of the Department of Agriculture',
    description: 'The official platform bridging the gap between harvest and market. AgriProcure utilizes predictive modeling to route farmers to optimal procurement centers, eliminating wait times and ensuring seamless capacity management for officers.',
    farmerLogin: 'Farmer Portal Login',
    farmerRegister: 'Register as Farmer',
    officerLogin: 'Officer Portal Login',
    officerRegister: 'Register as Officer',
    illustrationAlt: 'Illustration of terraced farm fields',

    // Auth common
    farmerLoginTitle: 'Farmer login',
    farmerLoginSubtitle: 'Log in to track your slot, queue and payments.',
    farmerRegisterTitle: 'Farmer registration',
    farmerRegisterSubtitle: 'Register your farm to receive automated slot allocations.',
    officerLoginTitle: 'Officer login',
    officerLoginSubtitle: 'Access procurement management and live monitoring.',
    officerRegisterTitle: 'Officer registration',
    officerRegisterSubtitle: 'Create an officer account for your assigned district.',
    usernameOrMobile: 'Username or mobile number',
    password: 'Password',
    fullName: 'Full name',
    mobileNumber: 'Mobile number',
    district: 'District',
    centerAssigned: 'Assigned Center',
    designation: 'Designation',
    landAcreage: 'Land acreage (acres)',
    primaryCrop: 'Primary crop',
    loginBtn: 'Log in',
    registerBtn: 'Register',
    newHereFarmer: 'New here? Create a farmer account',
    alreadyFarmer: 'Already registered? Log in here',
    newHereOfficer: 'New officer? Register here',
    alreadyOfficer: 'Already have an account? Log in here',
    logout: 'Log out',

    // Farmer Tabs / Nav
    farmerNav: {
      dashboard: 'Dashboard',
      addCrop: 'Add crop',
      recommendedCenters: 'Recommended centers',
      slot: 'My slot',
      liveQueue: 'Live queue',
      timeline: 'Procurement timeline',
      payments: 'Payments',
      notifications: 'Notifications',
      profile: 'Profile',
    },

    // Officer Tabs / Nav
    officerNav: {
      dashboard: 'Dashboard',
      centers: 'Centers',
      demandForecast: 'AI demand forecast',
      overloadRisk: 'Overload risk',
      farmerAllocation: 'Farmer allocation',
      digitalTwin: 'Digital twin',
      payments: 'Payments',
      notifications: 'Notifications',
      profile: 'Profile',
    },

    // Farmer Home
    farmerHome: {
      welcome: 'Welcome back',
      subtitle: 'Here is where your current harvest stands.',
      currentCrop: 'Current crop',
      notAdded: 'Not added yet',
      qtlExpected: 'qtl expected',
      addCropToStart: 'Add a crop to get started',
      selectedCenter: 'Selected center',
      slotDate: 'Slot date',
      tokenNumber: 'Token number',
      estimatedWait: 'Estimated wait time',
      procurementStatus: 'Procurement status',
      slotConfirmed: 'Slot confirmed',
      noActiveSlot: 'No active slot',
      readyTitle: 'Ready for your next harvest?',
      readyDesc: 'Add your crop details and let AI find the best procurement center for you.',
      addCropBtn: 'Add crop',
      confirmedTitle: 'Your slot is confirmed',
      confirmedDesc: 'Track your queue position in real time.',
      openLiveQueueBtn: 'Open live queue',
    },

    // Add Crop
    addCropPage: {
      title: 'Add crop details',
      subtitle: 'Tell us about your harvest so we can find the right procurement center.',
      selectCrop: 'Select crop',
      landArea: 'Land area (acres)',
      expectedQty: 'Expected quantity (qtl)',
      expectedHarvestDate: 'Expected harvest date',
      preferredArrivalDate: 'Preferred arrival date',
      finding: 'Finding centers…',
      findBtn: 'Find best procurement centers',
      aiAnalyzing: 'AI is analyzing nearby procurement centers…',
    },

    // Recommended Centers
    recommendedPage: {
      title: 'Recommended procurement centers',
      subtitle: 'Based on your crop, quantity and location, here are the best matches.',
      useCurrentLoc: 'Use current location',
      enterManualLoc: 'Enter location manually',
      detectedLoc: 'Detected: Ambasamudram Taluk, Tirunelveli',
      searchPlaceholder: 'Enter village or town',
      distance: 'Distance',
      countersOpen: 'Counters open',
      currentQueue: 'Current queue',
      availability: 'Availability',
      aiScore: 'AI score',
      close: 'Close',
      bookSlot: 'Book slot',
      viewDetails: 'View details',
      farmers: 'farmers',
    },

    // Slot Confirmation
    slotPage: {
      smsSuccess: 'Delivered to your WhatsApp (+91 98765 43210)',
      whatsAppSuccess: 'Delivered to your WhatsApp (+91 98765 43210)',
      whatsAppChatTitle: 'AgriProcure Official Bot',
      openWhatsApp: 'Open in WhatsApp',
      shareWhatsApp: 'Share on WhatsApp',
      whatsAppAlertsActive: 'Live queue alerts & gate token delivered via WhatsApp',
      confirmedTitle: 'Your slot is confirmed',
      slotLabel: 'Slot',
      tokenLabel: 'Token',
      dateLabel: 'Date',
      timeLabel: 'Time',
      expectedArrival: 'Expected arrival',
      estimatedWait: 'Estimated waiting time',
      minutes: 'minutes',
      showAtEntry: 'Show at entry',
      trackQueueBtn: 'Track live queue',
      viewTimelineBtn: 'View timeline',
    },

    // Live Queue
    liveQueuePage: {
      title: 'Live queue',
      subtitle: 'Your position updates automatically as farmers ahead of you are served.',
      whyWait: 'Why {min} minutes?',
      aiConfidence: 'AI confidence',
      farmersAhead: '{count} farmers ahead in the queue',
      avgInspection: 'Average inspection time: 4 minutes per farmer',
      counterUnavailable: '1 counter temporarily unavailable',
      arrivalRateHigh: 'Current farmer arrival rate is high',
      simulateNextBtn: 'Simulate next stage (demo)',
      token: 'Token',
      position: 'Position',
      mins: 'min',
    },

    // Procurement Timeline
    timelinePage: {
      title: 'Procurement timeline',
      subtitle: 'Track every stage of your crop, from confirmation to payment.',
      qualityInspection: 'Quality Inspection',
    },

    // Payments Interface (Razorpay)
    paymentsPage: {
      farmerTitle: 'Payments & Payouts',
      farmerSubtitle: 'Manage slot verification fees and track your government MSP procurement payouts via Razorpay.',
      officerTitle: 'Disbursements & Payouts',
      officerSubtitle: 'Disburse direct MSP procurement payments to farmers via RazorpayX.',
      securedByRazorpay: 'Secured by Razorpay',
      slotFeeTitle: 'Slot Booking & Inspection Fee',
      slotFeeDesc: 'Nominal verification fee for queue prioritization and automated moisture testing.',
      amountDue: 'Amount to Pay',
      payNowBtn: 'Pay with Razorpay',
      paymentSuccess: 'Payment Successful!',
      paymentId: 'Razorpay Payment ID',
      orderId: 'Order ID',
      paidOn: 'Paid On',
      method: 'Payment Method',
      downloadReceipt: 'Download Receipt',
      payoutStatusTitle: 'Harvest MSP Payout Status',
      payoutStatusDesc: 'Direct benefit transfer credited to farmer bank account upon weighment completion.',
      expectedPayout: 'Expected MSP Payout',
      payoutAccount: 'Bank Account',
      payoutStatus: 'Payout Status',
      credited: 'Credited',
      processing: 'Processing',
      pendingInspection: 'Pending Weighment',
      historyTitle: 'Recent Transactions',
      txnId: 'Transaction ID',
      date: 'Date',
      type: 'Type',
      amount: 'Amount',
      status: 'Status',
      upi: 'UPI (GPay / PhonePe / Paytm)',
      card: 'Debit / Credit Card',
      netbanking: 'Net Banking',
      disburseBtn: 'Disburse via RazorpayX',
      totalDisbursed: 'Total Disbursed Today',
      pendingDisbursement: 'Pending Disbursements',
      completedBatches: 'Completed Batches',
      farmersQueueForPayout: 'Farmers Awaiting MSP Payout',
      disburseAll: 'Disburse All Pending (RazorpayX)',
      disburseSuccess: 'Payout successfully disbursed via RazorpayX!',
      keyPlaceholder: 'Razorpay Key ID (optional test key)',
      testModeNotice: 'Test / Demo mode active: instant payment simulation available.',
      payFee: 'Pay ₹50 Verification Fee',
      paidBadge: 'Fee Paid ✓',
      selectMethod: 'Select Payment Method',
      enterUpiId: 'Enter UPI ID (e.g. farmer@okaxis)',
      cardNumber: 'Card Number',
      cardExpiry: 'MM/YY',
      cardCvv: 'CVV',
      selectBank: 'Select Bank',
      cancel: 'Cancel',
      verifying: 'Processing with Razorpay…',
    },

    // Farmer & Officer Notifications
    notificationsPage: {
      farmerTitle: 'Notifications',
      farmerSubtitle: 'Updates about your slot, queue and payments.',
      officerTitle: 'Notifications',
      officerSubtitle: 'Alerts about capacity, overload risk and reassignments.',
    },

    // Profiles
    profilePage: {
      farmerTitle: 'Profile',
      officerTitle: 'Profile',
      verifiedFarmer: 'Verified farmer account',
      officerAccount: 'Procurement officer account',
      completeReg: 'Complete registration to see more details here.',
      labels: {
        Name: 'Name',
        'Mobile number': 'Mobile number',
        Address: 'Address',
        District: 'District',
        State: 'State',
        'Land location': 'Land location',
        'Land area': 'Land area',
        'Crop details': 'Crop details',
        'Officer ID': 'Officer ID',
        Department: 'Department',
      },
    },

    // Officer Home
    officerHome: {
      title: 'Operations overview',
      subtitle: 'Live snapshot across all procurement centers today.',
      totalFarmers: 'Total farmers today',
      totalCenters: 'Total centers',
      activeSlots: 'Active slots',
      avgWaitTime: 'Average waiting time',
      overloadedCenters: 'Overloaded centers',
      availableCounters: 'Available counters',
      farmerArrivalsToday: 'Farmer arrivals today',
      centerUtilization: 'Center utilization',
    },

    // Center Management
    centerManagement: {
      title: 'Procurement centers',
      subtitle: 'Select a center to view its demand forecast and take action.',
      capacity: 'Capacity',
      expectedFarmers: 'Expected farmers',
      currentQueue: 'Current queue',
      counters: 'Counters',
      viewForecastBtn: 'View demand forecast',
    },

    // Demand Forecast
    demandForecast: {
      title: 'Demand forecast',
      subtitle: 'AI predicted farmer arrivals for tomorrow and the coming week.',
      predictedArrivals: 'Predicted farmer arrivals',
      predictedFarmers: 'Predicted farmers',
      expectedCropQty: 'Expected crop quantity',
      centerCapacity: 'Center capacity',
      expectedUtilization: 'Expected utilization',
      overloadRisk: 'Overload risk',
      viewRiskDetailsBtn: 'View overload risk details',
      tomorrow: 'Tomorrow',
      next3Days: 'Next 3 days',
      next7Days: 'Next 7 days',
    },

    // Overload Risk
    overloadRiskPage: {
      title: 'Overload risk',
      detected: 'High overload risk detected',
      predictedDemand: 'Predicted demand',
      centerCapacity: 'Center capacity',
      excess: 'Excess',
      farmers: 'farmers',
      viewRecommendedBtn: 'View AI recommended centers',
    },

    // Farmer Allocation
    farmerAllocationPage: {
      title: 'Farmer allocation',
      subtitle: 'Shift farmers from {center} to a nearby center with spare capacity.',
      distance: 'Distance',
      availableCapacity: 'Available capacity',
      expectedWait: 'Expected wait',
      farmersInQueue: 'Farmers in queue',
      selectToReassign: 'Select which farmers to reassign to {target}.',
      shiftCountLabel: 'Number of farmers to shift',
      shiftBtn: 'Shift {count} farmers',
      successMsg: '{count} farmers successfully reassigned.',
      notificationsSent: 'WhatsApp alerts sent to affected farmers with rescheduled tokens.',
    },

    // Digital Twin
    digitalTwinPage: {
      title: 'Digital twin',
      subtitle: 'Simulate real-world conditions before they happen.',
      selectCenter: 'Select procurement center',
      currentFarmers: 'Current farmers',
      currentQueue: 'Current queue',
      countersAvailable: 'Counters available',
      avgWait: 'Avg waiting time',
      capacity: 'Capacity',
      weather: 'Weather',
      weatherClear: 'Clear',
      weatherRain: 'Heavy rain',
      scenariosTitle: 'What-if scenario parameters',
      addCounter: 'Add 1 counter',
      removeCounter: 'Remove 1 counter (staff shortage)',
      heavyRainCheck: 'Heavy rain event (+35% delay)',
      surgeCheck: 'Farmer arrival surge',
      extraFarmersPlaceholder: 'Extra farmers',
      runBtn: 'Run simulation model',
      simResultsTitle: 'Simulation outcome',
      baseline: 'Baseline',
      simulated: 'Simulated',
      overloadDetected: 'Predicted overload detected in this scenario',
      mitigateTitle: 'AI mitigation recommendation',
      mitigateDesc: 'Shift {count} farmers to nearby {center} to reduce wait times by {pct}%.',
      shiftNowBtn: 'Apply mitigation shift',
      mitigationSuccess: 'Mitigation applied: {count} farmers redirected to {center}.',
    },

    // Common risk badges
    risks: {
      'Low Risk': 'Low Risk',
      'Medium Risk': 'Medium Risk',
      'High Risk': 'High Risk',
      Low: 'Low',
      Medium: 'Medium',
      High: 'High',
      Open: 'Open',
      Normal: 'Normal',
      'Slot confirmed': 'Slot confirmed',
      'No active slot': 'No active slot',
    },
  },

  Tamil: {
    brand: 'அக்ரிப்ரோக்யூர்',
    tagline: 'தேசிய வேளாண் கொள்முதல் அமைப்பு',
    headline: 'தரவு அடிப்படையிலான தொழில்நுட்பம் மூலம் கொள்முதலை முறைப்படுத்துதல்.',
    govBanner: 'வேளாண்மைத் துறையின் அதிகாரப்பூர்வ அமைப்பு',
    description:
      'அறுவடைக்கும் சந்தைக்கும் இடையிலான இடைவெளியைக் குறைக்கும் அதிகாரப்பூர்வ தளம். விவசாயிகளை சரியான கொள்முதல் மையங்களுக்கு வழிநடத்தவும், காத்திருப்பு நேரத்தை தவிர்க்கவும், அலுவலர்களுக்கான கொள்ளளவு மேலாண்மையை உறுதி செய்யவும் அக்ரிப்ரோக்யூர் முன்கணிப்பு தொழில்நுட்பத்தைப் பயன்படுத்துகிறது.',
    farmerLogin: 'விவசாயி வலைவாசல் (Login)',
    farmerRegister: 'விவசாயியாக பதிவு செய்க',
    officerLogin: 'அலுவலர் வலைவாசல் (Login)',
    officerRegister: 'அலுவலராக பதிவு செய்க',
    illustrationAlt: 'விவசாய விளைநிலங்களின் விளக்கம்',

    // Auth common
    farmerLoginTitle: 'விவசாயி உள்நுழைவு',
    farmerLoginSubtitle: 'உங்கள் நேரம், வரிசை நிலை மற்றும் விவரங்களைக் கண்காணிக்க உள்நுழையவும்.',
    farmerRegisterTitle: 'விவசாயி பதிவு',
    farmerRegisterSubtitle: 'தானியங்கி கொள்முதல் ஒதுக்கீடுகளைப் பெற உங்கள் பண்ணையைப் பதிவு செய்யவும்.',
    officerLoginTitle: 'அலுவலர் உள்நுழைவு',
    officerLoginSubtitle: 'கொள்முதல் மேலாண்மை மற்றும் நேரலைக் கண்காணிப்பை அணுகவும்.',
    officerRegisterTitle: 'அலுவலர் பதிவு',
    officerRegisterSubtitle: 'உங்கள் மாவட்டத்திற்கான அலுவலர் கணக்கை உருவாக்கவும்.',
    usernameOrMobile: 'பயனர்பெயர் அல்லது அலைபேசி எண்',
    password: 'கடவுச்சொல்',
    fullName: 'முழு பெயர்',
    mobileNumber: 'அலைபேசி எண்',
    district: 'மாவட்டம்',
    centerAssigned: 'ஒதுக்கப்பட்ட கொள்முதல் மையம்',
    designation: 'பதவி',
    landAcreage: 'நில அளவு (ஏக்கர்)',
    primaryCrop: 'முக்கிய பயிர்',
    loginBtn: 'உள்நுழைக',
    registerBtn: 'பதிவு செய்க',
    newHereFarmer: 'புதியவரா? விவசாயி கணக்கை உருவாக்கவும்',
    alreadyFarmer: 'ஏற்கனவே பதிவு செய்துள்ளீர்களா? உள்நுழையவும்',
    newHereOfficer: 'புதிய அலுவலரா? இங்கு பதிவு செய்யவும்',
    alreadyOfficer: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்',
    logout: 'வெளியேறு',

    // Farmer Tabs / Nav
    farmerNav: {
      dashboard: 'முகப்பு',
      addCrop: 'பயிர் சேர்க்க',
      recommendedCenters: 'பரிந்துரைக்கப்பட்ட மையங்கள்',
      slot: 'எனது முன்பதிவு நேரம்',
      liveQueue: 'நேரலை வரிசை',
      timeline: 'கொள்முதல் காலவரிசை',
      payments: 'பணம் செலுத்துதல்',
      notifications: 'அறிவிப்புகள்',
      profile: 'சுயவிவரம்',
    },

    // Officer Tabs / Nav
    officerNav: {
      dashboard: 'முகப்பு',
      centers: 'கொள்முதல் மையங்கள்',
      demandForecast: 'AI தேவை முன்கணிப்பு',
      overloadRisk: 'நெரிசல் அபாய நிலை',
      farmerAllocation: 'விவசாயிகள் ஒதுக்கீடு',
      digitalTwin: 'டிஜிட்டல் ட்வின்',
      payments: 'பணம் வழங்கல்',
      notifications: 'அறிவிப்புகள்',
      profile: 'சுயவிவரம்',
    },

    // Farmer Home
    farmerHome: {
      welcome: 'மீண்டும் வருக',
      subtitle: 'உங்கள் தற்போதைய அறுவடை மற்றும் கொள்முதல் நிலை இதோ.',
      currentCrop: 'தற்போதைய பயிர்',
      notAdded: 'இன்னும் சேர்க்கப்படவில்லை',
      qtlExpected: 'குவின்டால் எதிர்பார்க்கப்படுகிறது',
      addCropToStart: 'தொடங்குவதற்கு பயிரைச் சேர்க்கவும்',
      selectedCenter: 'தேர்ந்தெடுக்கப்பட்ட மையம்',
      slotDate: 'முன்பதிவு தேதி',
      tokenNumber: 'டோக்கன் எண்',
      estimatedWait: 'மதிப்பிடப்பட்ட காத்திருப்பு நேரம்',
      procurementStatus: 'கொள்முதல் நிலை',
      slotConfirmed: 'முன்பதிவு உறுதி செய்யப்பட்டது',
      noActiveSlot: 'செயலில் முன்பதிவு இல்லை',
      readyTitle: 'அடுத்த அறுவடைக்குத் தயாரா?',
      readyDesc: 'பயிர் விவரங்களைச் சேர்க்கவும், AI உங்களுக்கான சிறந்த மையத்தைக் கண்டறியும்.',
      addCropBtn: 'பயிர் சேர்க்க',
      confirmedTitle: 'உங்கள் முன்பதிவு நேரம் உறுதி செய்யப்பட்டது',
      confirmedDesc: 'நேரலையில் உங்கள் வரிசை நிலையை உடனுக்குடன் கண்காணிக்கவும்.',
      openLiveQueueBtn: 'நேரலை வரிசையைத் திறக்கவும்',
    },

    // Add Crop
    addCropPage: {
      title: 'பயிர் விவரங்களைச் சேர்க்கவும்',
      subtitle: 'சரியான கொள்முதல் மையத்தைக் கண்டறிய உங்கள் அறுவடை விவரங்களைத் தெரிவிக்கவும்.',
      selectCrop: 'பயிரைத் தேர்ந்தெடுக்கவும்',
      landArea: 'நிலப்பரப்பு (ஏக்கர்)',
      expectedQty: 'எதிர்பார்க்கப்படும் அளவு (குவின்டால்)',
      expectedHarvestDate: 'எதிர்பார்க்கப்படும் அறுவடை தேதி',
      preferredArrivalDate: 'விரும்பிய வருகை தேதி',
      finding: 'மையங்களைத் தேடுகிறது…',
      findBtn: 'சிறந்த கொள்முதல் மையங்களைக் கண்டறியவும்',
      aiAnalyzing: 'AI அருகிலுள்ள கொள்முதல் மையங்களை ஆய்வு செய்கிறது…',
    },

    // Recommended Centers
    recommendedPage: {
      title: 'பரிந்துரைக்கப்பட்ட கொள்முதல் மையங்கள்',
      subtitle: 'உங்கள் பயிர், அளவு மற்றும் இருப்பிடத்தின் அடிப்படையில் சிறந்த மையங்கள் இதோ.',
      useCurrentLoc: 'தற்போதைய இருப்பிடத்தைப் பயன்படுத்து',
      enterManualLoc: 'இருப்பிடத்தை கைமுறையாக உள்ளிடவும்',
      detectedLoc: 'கண்டறியப்பட்டது: அம்பாசமுத்திரம் தாலுகா, திருநெல்வேலி',
      searchPlaceholder: 'கிராமம் அல்லது ஊரின் பெயரை உள்ளிடவும்',
      distance: 'தூரம்',
      countersOpen: 'செயல்படும் கவுண்டர்கள்',
      currentQueue: 'தற்போதைய வரிசை',
      availability: 'கிடைக்கும் நிலை',
      aiScore: 'AI பொருத்தம்',
      close: 'மூடுக',
      bookSlot: 'நேரம் முன்பதிவு செய்க',
      viewDetails: 'விவரங்களைக் காண்க',
      farmers: 'விவசாயிகள்',
    },

    // Slot Confirmation
    slotPage: {
      smsSuccess: 'உங்கள் வாட்ஸ்அப்பிற்கு வெற்றிகரமாக அனுப்பப்பட்டது (+91 98765 43210)',
      whatsAppSuccess: 'உங்கள் வாட்ஸ்அப்பிற்கு வெற்றிகரமாக அனுப்பப்பட்டது (+91 98765 43210)',
      whatsAppChatTitle: 'அக்ரிப்ரோக்யூர் அதிகாரப்பூர்வ வாட்ஸ்அப் பாட்',
      openWhatsApp: 'வாட்ஸ்அப்பில் திறக்கவும்',
      shareWhatsApp: 'வாட்ஸ்அப்பில் பகிரவும்',
      whatsAppAlertsActive: 'நேரலை வரிசை அறிவிப்புகள் வாட்ஸ்அப்பில் இயக்கப்பட்டுள்ளன',
      confirmedTitle: 'உங்கள் முன்பதிவு நேரம் உறுதி செய்யப்பட்டது',
      slotLabel: 'முன்பதிவு எண்',
      tokenLabel: 'டோக்கன்',
      dateLabel: 'தேதி',
      timeLabel: 'நேரம்',
      expectedArrival: 'எதிர்பார்க்கப்படும் வருகை',
      estimatedWait: 'மதிப்பிடப்பட்ட காத்திருப்பு நேரம்',
      minutes: 'நிமிடங்கள்',
      showAtEntry: 'நுழைவாயிலில் காண்பிக்கவும்',
      trackQueueBtn: 'நேரலை வரிசையைக் கண்காணிக்கவும்',
      viewTimelineBtn: 'காலவரிசையைக் காண்க',
    },

    // Live Queue
    liveQueuePage: {
      title: 'நேரலை வரிசை',
      subtitle: 'முன்னால் உள்ள விவசாயிகளுக்கு சேவை வழங்கப்படும்போது உங்கள் வரிசை நிலை தானாக மாறும்.',
      whyWait: 'காத்திருப்பு நேரம் ஏன் {min} நிமிடங்கள்?',
      aiConfidence: 'AI துல்லியம்',
      farmersAhead: '{count} விவசாயிகள் வரிசையில் முன்னால் உள்ளனர்',
      avgInspection: 'சராசரி ஆய்வு நேரம்: விவசாயிக்கு 4 நிமிடங்கள்',
      counterUnavailable: '1 கவுண்டர் தற்காலிகமாக மூடப்பட்டுள்ளது',
      arrivalRateHigh: 'தற்போது விவசாயிகள் வருகை அதிகமாக உள்ளது',
      simulateNextBtn: 'அடுத்த கட்டத்தை உருவகப்படுத்து (டெமோ)',
      token: 'டோக்கன்',
      position: 'வரிசை நிலை',
      mins: 'நிமிடம்',
    },

    // Procurement Timeline
    timelinePage: {
      title: 'கொள்முதல் காலவரிசை',
      subtitle: 'முன்பதிவு முதல் பணம் பெறுவது வரை உங்கள் பயிரின் ஒவ்வொரு நிலையையும் கண்காணிக்கவும்.',
      qualityInspection: 'தரப் பரிசோதனை',
    },

    // Payments Interface (Razorpay)
    paymentsPage: {
      farmerTitle: 'பணம் செலுத்துதல் & வரவு விவரங்கள்',
      farmerSubtitle: 'முன்பதிவு கட்டணங்களை ரேசர்பே மூலம் செலுத்துங்கள் மற்றும் உங்கள் அரசு MSP கொள்முதல் வரவுகளைக் கண்காணிக்கவும்.',
      officerTitle: 'விவசாயிகள் பணப்பட்டுவாடா',
      officerSubtitle: 'ரேசர்பே (RazorpayX) மூலம் விவசாயிகளுக்கு நேரடி கொள்முதல் தொகையை வழங்கவும்.',
      securedByRazorpay: 'ரேசர்பே (Razorpay) பாதுகாப்புடன்',
      slotFeeTitle: 'முன்பதிவு & ஆய்வு கட்டணம்',
      slotFeeDesc: 'வரிசை முன்னுரிமை மற்றும் தானியங்கி ஈரப்பதம் ஆய்வுக்கான எளிய கட்டணம்.',
      amountDue: 'செலுத்த வேண்டிய தொகை',
      payNowBtn: 'ரேசர்பே மூலம் செலுத்தவும்',
      paymentSuccess: 'பணம் வெற்றிகரமாக செலுத்தப்பட்டது!',
      paymentId: 'ரேசர்பே கட்டண ஐடி',
      orderId: 'ஆர்டர் ஐடி',
      paidOn: 'செலுத்தப்பட்ட தேதி',
      method: 'கட்டண முறை',
      downloadReceipt: 'ரசீதை பதிவிறக்குக',
      payoutStatusTitle: 'விவசாயி MSP வரவு நிலை',
      payoutStatusDesc: 'எடை சரிபார்ப்பிற்குப் பிறகு விவசாயியின் வங்கிக் கணக்கிற்கு நேரடியாக வரவு வைக்கப்படும்.',
      expectedPayout: 'எதிர்பார்க்கப்படும் கொள்முதல் தொகை',
      payoutAccount: 'வங்கிக் கணக்கு',
      payoutStatus: 'வரவு நிலை',
      credited: 'வரவு வைக்கப்பட்டது',
      processing: 'செயல்பாட்டில் உள்ளது',
      pendingInspection: 'எடை சரிபார்ப்பு நிலுவையில்',
      historyTitle: 'சமீபத்திய பரிவர்த்தனைகள்',
      txnId: 'பரிவர்த்தனை ஐடி',
      date: 'தேதி',
      type: 'வகை',
      amount: 'தொகை',
      status: 'நிலை',
      upi: 'UPI (ஜிபே / போன்பே / பேடிஎம்)',
      card: 'டெபிட் / கிரெடிட் கார்டு',
      netbanking: 'நெட் பேங்கிங்',
      disburseBtn: 'ரேசர்பே மூலம் வழங்குக',
      totalDisbursed: 'இன்று வழங்கப்பட்ட மொத்த தொகை',
      pendingDisbursement: 'நிலுவையில் உள்ள தொகைகள்',
      completedBatches: 'முடிக்கப்பட்ட தொகுதிகள்',
      farmersQueueForPayout: 'கொள்முதல் தொகை பெறக் காத்திருக்கும் விவசாயிகள்',
      disburseAll: 'அனைத்து நிலுவைத் தொகையையும் வழங்குக (RazorpayX)',
      disburseSuccess: 'கொள்முதல் தொகை ரேசர்பே மூலம் வெற்றிகரமாக வழங்கப்பட்டது!',
      keyPlaceholder: 'ரேசர்பே Key ID (விருப்பத்தேர்வு)',
      testModeNotice: 'டெஸ்ட் / டெமோ பயன்முறை செயலில் உள்ளது: உடனடி கட்டண உருவகப்படுத்தல் தயார்.',
      payFee: '₹50 கட்டணம் செலுத்தவும்',
      paidBadge: 'கட்டணம் செலுத்தப்பட்டது ✓',
      selectMethod: 'கட்டண முறையைத் தேர்ந்தெடுக்கவும்',
      enterUpiId: 'UPI ஐடியை உள்ளிடவும் (எ.கா. farmer@okaxis)',
      cardNumber: 'கார்டு எண்',
      cardExpiry: 'மாதம்/ஆண்டு',
      cardCvv: 'CVV',
      selectBank: 'வங்கியைத் தேர்ந்தெடுக்கவும்',
      cancel: 'ரத்து செய்க',
      verifying: 'ரேசர்பே மூலம் சரிபார்க்கப்படுகிறது…',
    },

    // Farmer & Officer Notifications
    notificationsPage: {
      farmerTitle: 'அறிவிப்புகள்',
      farmerSubtitle: 'உங்கள் முன்பதிவு, வரிசை நிலை மற்றும் பணம் செலுத்துதல் பற்றிய அறிவிப்புகள்.',
      officerTitle: 'அறிவிப்புகள்',
      officerSubtitle: 'கொள்ளளவு, நெரிசல் அபாயம் மற்றும் மறுஒதுக்கீடு பற்றிய எச்சரிக்கைகள்.',
    },

    // Profiles
    profilePage: {
      farmerTitle: 'சுயவிவரம்',
      officerTitle: 'சுயவிவரம்',
      verifiedFarmer: 'சரிபார்க்கப்பட்ட விவசாயி கணக்கு',
      officerAccount: 'கொள்முதல் அலுவலர் கணக்கு',
      completeReg: 'முழு விவரங்களையும் காண பதிவை நிறைவு செய்யவும்.',
      labels: {
        Name: 'பெயர்',
        'Mobile number': 'அலைபேசி எண்',
        Address: 'முகவரி',
        District: 'மாவட்டம்',
        State: 'மாநிலம்',
        'Land location': 'நில அமைவிடம்',
        'Land area': 'நிலப்பரப்பு',
        'Crop details': 'பயிர் விவரங்கள்',
        'Officer ID': 'அலுவலர் ஐடி',
        Department: 'துறை',
      },
    },

    // Officer Home
    officerHome: {
      title: 'செயல்பாடுகள் கண்ணோட்டம்',
      subtitle: 'இன்றைய அனைத்து கொள்முதல் மையங்களின் நேரலை விவரங்கள்.',
      totalFarmers: 'இன்றைய மொத்த விவசாயிகள்',
      totalCenters: 'மொத்த மையங்கள்',
      activeSlots: 'செயலில் உள்ள முன்பதிவுகள்',
      avgWaitTime: 'சராசரி காத்திருப்பு நேரம்',
      overloadedCenters: 'நெரிசலான மையங்கள்',
      availableCounters: 'செயல்படும் கவுண்டர்கள்',
      farmerArrivalsToday: 'இன்றைய விவசாயிகள் வருகை',
      centerUtilization: 'மைய பயன்பாட்டு விகிதம்',
    },

    // Center Management
    centerManagement: {
      title: 'கொள்முதல் மையங்கள்',
      subtitle: 'தேவை முன்கணிப்பைக் காணவும் நடவடிக்கை எடுக்கவும் மையத்தைத் தேர்ந்தெடுக்கவும்.',
      capacity: 'கொள்ளளவு',
      expectedFarmers: 'எதிர்பார்க்கப்படும் விவசாயிகள்',
      currentQueue: 'தற்போதைய வரிசை',
      counters: 'கவுண்டர்கள்',
      viewForecastBtn: 'தேவை முன்கணிப்பைக் காண்க',
    },

    // Demand Forecast
    demandForecast: {
      title: 'தேவை முன்கணிப்பு',
      subtitle: 'நாளை மற்றும் வரும் வாரத்திற்கான AI கணிக்கப்பட்ட விவசாயிகள் வருகை.',
      predictedArrivals: 'கணிக்கப்பட்ட விவசாயிகள் வருகை',
      predictedFarmers: 'கணிக்கப்பட்ட விவசாயிகள்',
      expectedCropQty: 'எதிர்பார்க்கப்படும் பயிர் அளவு',
      centerCapacity: 'மையக் கொள்ளளவு',
      expectedUtilization: 'எதிர்பார்க்கப்படும் பயன்பாடு',
      overloadRisk: 'நெரிசல் அபாய நிலை',
      viewRiskDetailsBtn: 'நெரிசல் அபாய விவரங்களைக் காண்க',
      tomorrow: 'நாளை',
      next3Days: 'அடுத்த 3 நாட்கள்',
      next7Days: 'அடுத்த 7 நாட்கள்',
    },

    // Overload Risk
    overloadRiskPage: {
      title: 'நெரிசல் அபாய நிலை',
      detected: 'அதிக நெரிசல் அபாயம் கண்டறியப்பட்டுள்ளது',
      predictedDemand: 'கணிக்கப்பட்ட தேவை',
      centerCapacity: 'மையக் கொள்ளளவு',
      excess: 'கூடுதல் நெரிசல்',
      farmers: 'விவசாயிகள்',
      viewRecommendedBtn: 'AI பரிந்துரைத்த மையங்களைக் காண்க',
    },

    // Farmer Allocation
    farmerAllocationPage: {
      title: 'விவசாயிகள் மறுஒதுக்கீடு',
      subtitle: '{center} மையத்திலிருந்து கூடுதல் திறன் கொண்ட அருகிலுள்ள மையத்திற்கு விவசாயிகளை மாற்றவும்.',
      distance: 'தூரம்',
      availableCapacity: 'கிடைக்கும் கொள்ளளவு',
      expectedWait: 'எதிர்பார்க்கப்படும் காத்திருப்பு',
      farmersInQueue: 'வரிசையில் உள்ள விவசாயிகள்',
      selectToReassign: '{target} மையத்திற்கு மாற்ற வேண்டிய விவசாயிகளைத் தேர்ந்தெடுக்கவும்.',
      shiftCountLabel: 'மாற்ற வேண்டிய விவசாயிகளின் எண்ணிக்கை',
      shiftBtn: '{count} விவசாயிகளை மாற்றவும்',
      successMsg: '{count} விவசாயிகள் வெற்றிகரமாக மாற்றப்பட்டனர்.',
      notificationsSent: 'மாற்றப்பட்ட புதிய டோக்கன்களுடன் பாதிக்கப்பட்ட விவசாயிகளுக்கு வாட்ஸ்அப் அறிவிப்பு அனுப்பப்பட்டது.',
    },

    // Digital Twin
    digitalTwinPage: {
      title: 'டிஜிட்டல் ட்வின்',
      subtitle: 'நடைபெறுவதற்கு முன்பே நிஜ நிலைமைகளை உருவகப்படுத்துங்கள்.',
      selectCenter: 'கொள்முதல் மையத்தைத் தேர்ந்தெடுக்கவும்',
      currentFarmers: 'தற்போதைய விவசாயிகள்',
      currentQueue: 'தற்போதைய வரிசை',
      countersAvailable: 'செயல்படும் கவுண்டர்கள்',
      avgWait: 'சராசரி காத்திருப்பு நேரம்',
      capacity: 'கொள்ளளவு',
      weather: 'வானிலை',
      weatherClear: 'தெளிவான வானிலை',
      weatherRain: 'கனமழை',
      scenariosTitle: 'சூழ்நிலை உருவகப்படுத்தல் அளவுருக்கள்',
      addCounter: '1 கவுண்டர் சேர்க்கவும்',
      removeCounter: '1 கவுண்டரை மூடவும் (ஊழியர் பற்றாக்குறை)',
      heavyRainCheck: 'கனமழை சூழல் (+35% தாமதம்)',
      surgeCheck: 'விவசாயிகள் திடீர் வருகை அதிகரிப்பு',
      extraFarmersPlaceholder: 'கூடுதல் விவசாயிகள்',
      runBtn: 'உருவகப்படுத்துதலை இயக்கவும்',
      simResultsTitle: 'உருவகப்படுத்தல் முடிவுகள்',
      baseline: 'தற்போதைய நிலை',
      simulated: 'உருவகப்படுத்தப்பட்ட நிலை',
      overloadDetected: 'இந்த சூழ்நிலையில் அதிக நெரிசல் ஏற்பட வாய்ப்புள்ளது',
      mitigateTitle: 'AI நெரிசல் தணிப்பு பரிந்துரை',
      mitigateDesc: '{count} விவசாயிகளை அருகிலுள்ள {center} மையத்திற்கு மாற்றினால் காத்திருப்பு நேரம் {pct}% குறையும்.',
      shiftNowBtn: 'பரிந்துரைக்கப்பட்ட மாற்றத்தை செயல்படுத்தவும்',
      mitigationSuccess: 'செயல்படுத்தப்பட்டது: {count} விவசாயிகள் {center} மையத்திற்கு மாற்றப்பட்டனர்.',
    },

    // Common risk badges
    risks: {
      'Low Risk': 'குறைந்த அபாயம்',
      'Medium Risk': 'நடுத்தர அபாயம்',
      'High Risk': 'அதிக அபாயம்',
      Low: 'குறைவு',
      Medium: 'நடுத்தரம்',
      High: 'அதிகம்',
      Open: 'திறந்துள்ளது',
      Normal: 'இயல்பு',
      'Slot confirmed': 'முன்பதிவு உறுதி',
      'No active slot': 'முன்பதிவு இல்லை',
    },
  },
};

import { DOMAIN_DICTIONARY } from '../services/aiTranslation';

function createTamilProxy(taObj, enObj) {
  return new Proxy(taObj || {}, {
    get(target, prop) {
      if (typeof prop !== 'string') return target[prop];

      // 1. Direct translation key exists
      if (target[prop] !== undefined) {
        if (typeof target[prop] === 'object' && target[prop] !== null) {
          return createTamilProxy(target[prop], enObj?.[prop]);
        }
        return target[prop];
      }

      // 2. Lookup in domain dictionary
      const enVal = enObj?.[prop];
      if (typeof enVal === 'string' && DOMAIN_DICTIONARY[enVal.trim()]) {
        return DOMAIN_DICTIONARY[enVal.trim()];
      }

      // 3. Fallback to English object
      if (enVal !== undefined) {
        if (typeof enVal === 'object' && enVal !== null) {
          return createTamilProxy({}, enVal);
        }
        return enVal;
      }

      return target[prop];
    }
  });
}

export function getTranslation(language = 'English') {
  if (language === 'Tamil') {
    return createTamilProxy(translations.Tamil, translations.English);
  }
  return translations.English;
}

