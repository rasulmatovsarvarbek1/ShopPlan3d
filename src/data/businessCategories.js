export const BUSINESS_CATEGORIES = [
  {
    id: 'grocery',
    name: 'Oziq-ovqat va Supermarket',
    icon: 'ShoppingCart',
    badge: 'Ommabop',
    description: "Devoriy va orol javonlari, muzlatgichlar, meva-sabzavot stendlari va kassa zonalari bilan jihozlangan do'kon.",
    defaultDimensions: { width: 10, length: 12, height: 3.2 },
    defaultBudget: 25000,
    color: '#10b981', // Emerald green
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    equipmentPresets: {
      economy: [
        { id: 'g_shelf_wall', name: 'Devoriy Stellaj', count: 6, unitPrice: 250, color: '#374151', width: 1.2, depth: 0.5, height: 2.2, type: 'wall_shelf' },
        { id: 'g_fridge_stand', name: 'Vertikal Sovutgich', count: 2, unitPrice: 1200, color: '#3b82f6', width: 1.5, depth: 0.8, height: 2.0, type: 'fridge' },
        { id: 'g_cash_counter', name: 'Kassa Stoli', count: 1, unitPrice: 450, color: '#4b5563', width: 1.6, depth: 0.9, height: 1.0, type: 'counter' },
      ],
      standard: [
        { id: 'g_shelf_wall', name: 'Devoriy Stellaj', count: 10, unitPrice: 250, color: '#374151', width: 1.2, depth: 0.5, height: 2.2, type: 'wall_shelf' },
        { id: 'g_shelf_island', name: 'Orol Javon (Dvuxstoronniy)', count: 4, unitPrice: 420, color: '#4b5563', width: 2.0, depth: 0.9, height: 1.8, type: 'island_shelf' },
        { id: 'g_fridge_stand', name: 'Vertikal Sovutgich', count: 4, unitPrice: 1200, color: '#3b82f6', width: 1.5, depth: 0.8, height: 2.0, type: 'fridge' },
        { id: 'g_freezer_chest', name: 'Gorizontal Muzlatgich-Larat', count: 2, unitPrice: 850, color: '#60a5fa', width: 2.0, depth: 0.9, height: 0.9, type: 'chest_freezer' },
        { id: 'g_produce_rack', name: 'Meva-Sabzavot Stendi', count: 2, unitPrice: 380, color: '#84cc16', width: 1.8, depth: 0.8, height: 1.4, type: 'produce' },
        { id: 'g_cash_counter', name: 'Lenta Bilan Kassa Stoli', count: 2, unitPrice: 850, color: '#1f2937', width: 2.2, depth: 1.0, height: 1.0, type: 'counter' },
      ],
      premium: [
        { id: 'g_shelf_wall', name: 'Devoriy Stellaj (LED yoritgichli)', count: 14, unitPrice: 380, color: '#111827', width: 1.2, depth: 0.5, height: 2.4, type: 'wall_shelf' },
        { id: 'g_shelf_island', name: 'Orol Javon (Dvuxstoronniy)', count: 6, unitPrice: 550, color: '#1f2937', width: 2.4, depth: 1.0, height: 1.8, type: 'island_shelf' },
        { id: 'g_fridge_stand', name: 'Vitrinali Shisha Sovutgich', count: 6, unitPrice: 1600, color: '#2563eb', width: 1.8, depth: 0.8, height: 2.1, type: 'fridge' },
        { id: 'g_freezer_chest', name: 'Gorizontal Muzlatgich-Larat', count: 4, unitPrice: 950, color: '#3b82f6', width: 2.2, depth: 1.0, height: 0.9, type: 'chest_freezer' },
        { id: 'g_produce_rack', name: 'Meva-Sabzavot Stendi', count: 3, unitPrice: 480, color: '#65a30d', width: 2.0, depth: 0.9, height: 1.5, type: 'produce' },
        { id: 'g_cash_counter', name: 'Ekspress Kassa & Self-Checkout', count: 3, unitPrice: 1400, color: '#0f172a', width: 2.4, depth: 1.1, height: 1.1, type: 'counter' },
      ]
    },
    inventoryPricePerM2: 120, // $120 worth of food stock per m2
    renovationPricePerM2: 80,  // $80 renovation/floor/light per m2
  },
  {
    id: 'clothing',
    name: 'Kiyim-kechak va Poyabzal',
    icon: 'Shirt',
    badge: 'Zamonaviy',
    description: "Kiyim iluvchi veshalqalar, manekenlar, poyabzal javonlari, ko'zgular hamda kiyinish xonalari (fitting rooms).",
    defaultDimensions: { width: 8, length: 10, height: 3.0 },
    defaultBudget: 18000,
    color: '#ec4899', // Pink / Rose
    gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
    equipmentPresets: {
      economy: [
        { id: 'c_rack_wall', name: 'Devoriy Kiyim Stellaji', count: 6, unitPrice: 180, color: '#e11d48', width: 1.5, depth: 0.4, height: 2.0, type: 'clothing_rack' },
        { id: 'c_mannequin', name: 'Maneken (To\'liq bo\'y)', count: 2, unitPrice: 120, color: '#f43f5e', width: 0.5, depth: 0.5, height: 1.8, type: 'mannequin' },
        { id: 'c_fitting_room', name: 'Kiyinish Xonasi (Kabina)', count: 2, unitPrice: 350, color: '#be123c', width: 1.2, depth: 1.2, height: 2.4, type: 'fitting_room' },
        { id: 'c_cash_counter', name: 'Kassa Resepshn', count: 1, unitPrice: 400, color: '#881337', width: 1.5, depth: 0.7, height: 1.0, type: 'counter' }
      ],
      standard: [
        { id: 'c_rack_wall', name: 'Devoriy Kiyim Stellaji', count: 10, unitPrice: 220, color: '#e11d48', width: 1.5, depth: 0.4, height: 2.1, type: 'clothing_rack' },
        { id: 'c_rack_center', name: 'Aylana Orol Kiyim Stendi', count: 3, unitPrice: 320, color: '#fb7185', width: 1.2, depth: 1.2, height: 1.4, type: 'center_rack' },
        { id: 'c_shoe_shelf', name: 'Poyabzal Vitrinasi', count: 4, unitPrice: 260, color: '#fda4af', width: 1.2, depth: 0.4, height: 1.8, type: 'shoe_shelf' },
        { id: 'c_mannequin', name: 'Maneken (Premium)', count: 4, unitPrice: 160, color: '#f43f5e', width: 0.5, depth: 0.5, height: 1.8, type: 'mannequin' },
        { id: 'c_fitting_room', name: 'Kiyinish Xonasi (Kuzguli)', count: 3, unitPrice: 450, color: '#be123c', width: 1.3, depth: 1.3, height: 2.4, type: 'fitting_room' },
        { id: 'c_cash_counter', name: 'Butilka / Kassa Stoli', count: 1, unitPrice: 650, color: '#4c0519', width: 1.8, depth: 0.8, height: 1.0, type: 'counter' }
      ],
      premium: [
        { id: 'c_rack_wall', name: 'Devoriy LED Kiyim Stellaji', count: 14, unitPrice: 350, color: '#9f1239', width: 1.6, depth: 0.4, height: 2.3, type: 'clothing_rack' },
        { id: 'c_rack_center', name: 'Aylana Orol Kiyim Stendi', count: 5, unitPrice: 450, color: '#f43f5e', width: 1.4, depth: 1.4, height: 1.5, type: 'center_rack' },
        { id: 'c_shoe_shelf', name: 'Poyabzal LED Vitrinasi', count: 6, unitPrice: 380, color: '#fda4af', width: 1.5, depth: 0.4, height: 2.0, type: 'shoe_shelf' },
        { id: 'c_mannequin', name: 'Stilizatsiyalangan Manekenlar', count: 6, unitPrice: 220, color: '#fb7185', width: 0.5, depth: 0.5, height: 1.85, type: 'mannequin' },
        { id: 'c_fitting_room', name: 'VIP Kiyinish Xonasi (Divanli)', count: 4, unitPrice: 750, color: '#881337', width: 1.5, depth: 1.5, height: 2.5, type: 'fitting_room' },
        { id: 'c_cash_counter', name: 'Marmar Ko\'rinishli Kassa Bar', count: 1, unitPrice: 1200, color: '#4c0519', width: 2.2, depth: 0.9, height: 1.05, type: 'counter' }
      ]
    },
    inventoryPricePerM2: 150,
    renovationPricePerM2: 100,
  },
  {
    id: 'gym',
    name: 'Fitness Zal va Sport Klubi',
    icon: 'Dumbbell',
    badge: 'Sport & Health',
    description: "Yugurish yo'lakchalari, gantellar, kruchokli trenajyorlar, kiyinish shkaflari va retsepsiya zonasi.",
    defaultDimensions: { width: 12, length: 18, height: 3.5 },
    defaultBudget: 45000,
    color: '#f59e0b', // Amber / Gold
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    equipmentPresets: {
      economy: [
        { id: 'f_treadmill', name: 'Yugurish Yo\'lakchasi (Cardio)', count: 4, unitPrice: 1500, color: '#1f2937', width: 1.8, depth: 0.9, height: 1.4, type: 'treadmill' },
        { id: 'f_bench', name: 'Jim Yotish Skameyka (Bench Press)', count: 3, unitPrice: 350, color: '#374151', width: 1.5, depth: 0.8, height: 1.1, type: 'bench' },
        { id: 'f_dumbbell_rack', name: 'Gantellar Stendi (Set)', count: 2, unitPrice: 800, color: '#4b5563', width: 2.0, depth: 0.6, height: 0.9, type: 'dumbbell_rack' },
        { id: 'f_reception', name: 'Retsepsiya Stoli', count: 1, unitPrice: 600, color: '#b45309', width: 2.0, depth: 0.8, height: 1.1, type: 'counter' }
      ],
      standard: [
        { id: 'f_treadmill', name: 'Yugurish Yo\'lakchasi (Cardio)', count: 8, unitPrice: 1800, color: '#1f2937', width: 1.9, depth: 0.9, height: 1.4, type: 'treadmill' },
        { id: 'f_bike', name: 'Velo-trenajyor (Spin Bike)', count: 4, unitPrice: 750, color: '#4b5563', width: 1.2, depth: 0.6, height: 1.2, type: 'bike' },
        { id: 'f_bench', name: 'Jim Yotish Skameyka', count: 5, unitPrice: 400, color: '#374151', width: 1.5, depth: 0.8, height: 1.1, type: 'bench' },
        { id: 'f_crossover', name: 'Krossover Blokli Trenajyor', count: 2, unitPrice: 2200, color: '#111827', width: 3.5, depth: 1.0, height: 2.3, type: 'crossover' },
        { id: 'f_dumbbell_rack', name: 'Gantellar Stendi (To\'liq Set)', count: 3, unitPrice: 1000, color: '#4b5563', width: 2.4, depth: 0.7, height: 0.9, type: 'dumbbell_rack' },
        { id: 'f_lockers', name: 'Kiyinish Shkaflari (Blok)', count: 4, unitPrice: 500, color: '#d97706', width: 1.6, depth: 0.5, height: 2.0, type: 'lockers' },
        { id: 'f_reception', name: 'Fitnes Retsepsiya Bar', count: 1, unitPrice: 900, color: '#78350f', width: 2.4, depth: 0.9, height: 1.1, type: 'counter' }
      ],
      premium: [
        { id: 'f_treadmill', name: 'Pro Cardio Yugurish Yo\'lakchasi', count: 12, unitPrice: 2500, color: '#0f172a', width: 2.0, depth: 0.9, height: 1.5, type: 'treadmill' },
        { id: 'f_bike', name: 'Pro Velo-trenajyor', count: 6, unitPrice: 950, color: '#334155', width: 1.2, depth: 0.6, height: 1.2, type: 'bike' },
        { id: 'f_bench', name: 'Skameyka va Prisad Raki', count: 8, unitPrice: 550, color: '#1e293b', width: 1.6, depth: 0.9, height: 1.2, type: 'bench' },
        { id: 'f_crossover', name: 'Multi-Station Krossover Kompleks', count: 3, unitPrice: 3500, color: '#020617', width: 4.0, depth: 1.2, height: 2.4, type: 'crossover' },
        { id: 'f_dumbbell_rack', name: 'Xrom Gantel Stendlari', count: 4, unitPrice: 1400, color: '#64748b', width: 2.8, depth: 0.7, height: 0.9, type: 'dumbbell_rack' },
        { id: 'f_lockers', name: 'Elektron Qulfli Kiyinish Shkaflari', count: 8, unitPrice: 850, color: '#b45309', width: 1.8, depth: 0.5, height: 2.1, type: 'lockers' },
        { id: 'f_reception', name: 'Dizaynerlik Retsepsiya & Protein Bar', count: 1, unitPrice: 1800, color: '#451a03', width: 3.0, depth: 1.0, height: 1.1, type: 'counter' }
      ]
    },
    inventoryPricePerM2: 40,
    renovationPricePerM2: 90,
  },
  {
    id: 'cosmetics',
    name: 'Kosmetika va Parfyumeriya',
    icon: 'Sparkles',
    badge: 'Premium Beauty',
    description: "Shisha LED vitrinalar, makiyaj sinov stollari, parfyum stendlari va ko'zgular bilan bezatilgan salon-do'kon.",
    defaultDimensions: { width: 7, length: 9, height: 3.0 },
    defaultBudget: 15000,
    color: '#8b5cf6', // Violet / Purple
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    equipmentPresets: {
      economy: [
        { id: 'cos_wall_shelf', name: 'Shisha Devoriy Stellaj', count: 5, unitPrice: 280, color: '#c084fc', width: 1.2, depth: 0.4, height: 2.2, type: 'wall_shelf' },
        { id: 'cos_makeup_table', name: 'Makiyaj Test Stoli', count: 1, unitPrice: 400, color: '#a855f7', width: 1.4, depth: 0.6, height: 1.4, type: 'table' },
        { id: 'cos_cash', name: 'Kosmetika Kassa Stoli', count: 1, unitPrice: 350, color: '#6b21a8', width: 1.4, depth: 0.6, height: 1.0, type: 'counter' }
      ],
      standard: [
        { id: 'cos_wall_shelf', name: 'Shisha LED Devoriy Vitrina', count: 8, unitPrice: 350, color: '#c084fc', width: 1.4, depth: 0.4, height: 2.2, type: 'wall_shelf' },
        { id: 'cos_island_display', name: 'Orol Parfyum Vitrinasi', count: 2, unitPrice: 550, color: '#e879f9', width: 1.5, depth: 0.8, height: 1.1, type: 'island_shelf' },
        { id: 'cos_makeup_table', name: 'Ko\'zguli Test Stol & Stullar', count: 2, unitPrice: 600, color: '#a855f7', width: 1.6, depth: 0.7, height: 1.5, type: 'table' },
        { id: 'cos_cash', name: 'Butilka Kassa Stoli', count: 1, unitPrice: 550, color: '#6b21a8', width: 1.6, depth: 0.7, height: 1.0, type: 'counter' }
      ],
      premium: [
        { id: 'cos_wall_shelf', name: 'Premum Shisha Vitrina (RGB LED)', count: 12, unitPrice: 500, color: '#a855f7', width: 1.5, depth: 0.4, height: 2.3, type: 'wall_shelf' },
        { id: 'cos_island_display', name: 'Marmar Orol Parfyum Bar', count: 4, unitPrice: 850, color: '#f0abfc', width: 1.8, depth: 0.9, height: 1.1, type: 'island_shelf' },
        { id: 'cos_makeup_table', name: 'VIP Beauty-Bar Zoni', count: 3, unitPrice: 950, color: '#c084fc', width: 1.8, depth: 0.8, height: 1.6, type: 'table' },
        { id: 'cos_cash', name: 'Lyuks Marmar Kassa Bar', count: 1, unitPrice: 1100, color: '#581c87', width: 2.0, depth: 0.8, height: 1.05, type: 'counter' }
      ]
    },
    inventoryPricePerM2: 200,
    renovationPricePerM2: 110,
  },
  {
    id: 'electronics',
    name: 'Elektronika va Gadjetlar',
    icon: 'Smartphone',
    badge: 'Hi-Tech',
    description: "Smartfon va noutbuklar uchun demo stollar, televizorlar devori, aksessuar vitrinalari va Tech-Bar.",
    defaultDimensions: { width: 9, length: 11, height: 3.2 },
    defaultBudget: 35000,
    color: '#06b6d4', // Cyan / Teal
    gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    equipmentPresets: {
      economy: [
        { id: 'el_demo_table', name: 'Smartfon Demo Stoli', count: 3, unitPrice: 450, color: '#67e8f9', width: 2.0, depth: 0.9, height: 0.9, type: 'table' },
        { id: 'el_accessory_wall', name: 'Aksessuar Stellaji (Pegboard)', count: 4, unitPrice: 220, color: '#334155', width: 1.4, depth: 0.4, height: 2.2, type: 'wall_shelf' },
        { id: 'el_cash', name: 'Kassa va Konsultatsiya Stoli', count: 1, unitPrice: 500, color: '#0e7490', width: 1.8, depth: 0.8, height: 1.0, type: 'counter' }
      ],
      standard: [
        { id: 'el_demo_table', name: 'Smartfon Demo Stoli', count: 5, unitPrice: 600, color: '#67e8f9', width: 2.2, depth: 1.0, height: 0.9, type: 'table' },
        { id: 'el_laptop_table', name: 'Noutbuk va Planshet Stoli', count: 2, unitPrice: 700, color: '#22d3ee', width: 2.4, depth: 1.0, height: 0.9, type: 'table' },
        { id: 'el_accessory_wall', name: 'Aksessuar LED Stellaji', count: 6, unitPrice: 320, color: '#1e293b', width: 1.5, depth: 0.4, height: 2.3, type: 'wall_shelf' },
        { id: 'el_tv_wall', name: 'TV va Audio Ko\'rgazma Devori', count: 1, unitPrice: 1200, color: '#0f172a', width: 4.0, depth: 0.5, height: 2.5, type: 'tv_wall' },
        { id: 'el_cash', name: 'Tech-Bar Kassa Stoli', count: 1, unitPrice: 850, color: '#164e63', width: 2.2, depth: 0.9, height: 1.0, type: 'counter' }
      ],
      premium: [
        { id: 'el_demo_table', name: 'Premium Smartfon Demo Table (Yoritilgan)', count: 8, unitPrice: 900, color: '#a5f3fc', width: 2.4, depth: 1.1, height: 0.9, type: 'table' },
        { id: 'el_laptop_table', name: 'MacBook & Laptop Bar', count: 4, unitPrice: 1100, color: '#22d3ee', width: 2.6, depth: 1.1, height: 0.9, type: 'table' },
        { id: 'el_accessory_wall', name: 'Yoritilgan Aksessuar Vitrinasi', count: 8, unitPrice: 480, color: '#0f172a', width: 1.6, depth: 0.4, height: 2.4, type: 'wall_shelf' },
        { id: 'el_tv_wall', name: 'Smart TV & Home Theater Wall', count: 2, unitPrice: 2000, color: '#020617', width: 4.5, depth: 0.5, height: 2.6, type: 'tv_wall' },
        { id: 'el_cash', name: 'Apple Style Genius Bar', count: 1, unitPrice: 1600, color: '#083344', width: 3.0, depth: 1.0, height: 1.05, type: 'counter' }
      ]
    },
    inventoryPricePerM2: 250,
    renovationPricePerM2: 120,
  },
  {
    id: 'cafe',
    name: 'Kafeteriya va Qahvaxona',
    icon: 'Coffee',
    badge: 'Food & Drink',
    description: "Kofe-bar stoli, espresso apparati raki, qulay stol-stullar hamda shirinliklar vitrinasi.",
    defaultDimensions: { width: 8, length: 10, height: 3.0 },
    defaultBudget: 20000,
    color: '#78350f', // Warm Coffee Brown
    gradient: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
    equipmentPresets: {
      economy: [
        { id: 'cf_bar', name: 'Kofe Bar Stoli', count: 1, unitPrice: 800, color: '#78350f', width: 2.5, depth: 0.9, height: 1.1, type: 'counter' },
        { id: 'cf_pastry', name: 'Shirinliklar Sovutgich Vitrinasi', count: 1, unitPrice: 900, color: '#fde68a', width: 1.2, depth: 0.8, height: 1.3, type: 'fridge' },
        { id: 'cf_seating', name: 'Stol va 4 ta Stul Seti', count: 4, unitPrice: 250, color: '#d97706', width: 1.0, depth: 1.0, height: 0.8, type: 'seating' }
      ],
      standard: [
        { id: 'cf_bar', name: 'Espresso & Kofe Bar Stoli', count: 1, unitPrice: 1400, color: '#78350f', width: 3.2, depth: 1.0, height: 1.1, type: 'counter' },
        { id: 'cf_pastry', name: 'Pastry Shisha Vitrina', count: 1, unitPrice: 1200, color: '#fde68a', width: 1.5, depth: 0.8, height: 1.35, type: 'fridge' },
        { id: 'cf_seating', name: 'Yog\'och Stol + Stullar Seti', count: 7, unitPrice: 320, color: '#b45309', width: 1.1, depth: 1.1, height: 0.8, type: 'seating' },
        { id: 'cf_sofa', name: 'Yumshoq Divan Zoni', count: 2, unitPrice: 650, color: '#451a03', width: 1.8, depth: 0.9, height: 0.85, type: 'sofa' }
      ],
      premium: [
        { id: 'cf_bar', name: 'Lyuks Yog\'och & Marmar Kofe Bar', count: 1, unitPrice: 2400, color: '#451a03', width: 4.0, depth: 1.1, height: 1.15, type: 'counter' },
        { id: 'cf_pastry', name: 'Panoramik Shirinliklar Vitrinasi', count: 2, unitPrice: 1600, color: '#fef08a', width: 1.6, depth: 0.9, height: 1.4, type: 'fridge' },
        { id: 'cf_seating', name: 'Dizaynerlik Stol + Stullar Seti', count: 10, unitPrice: 450, color: '#92400e', width: 1.2, depth: 1.2, height: 0.8, type: 'seating' },
        { id: 'cf_sofa', name: 'Premium Teri Divanlar Lounge Zoni', count: 4, unitPrice: 950, color: '#27272a', width: 2.0, depth: 0.95, height: 0.9, type: 'sofa' }
      ]
    },
    inventoryPricePerM2: 70,
    renovationPricePerM2: 100,
  },
  {
    id: 'pharmacy',
    name: 'Dorixona va Med-Do\'kon',
    icon: 'Cross',
    badge: 'Tibbiyot',
    description: "Shisha dori javonlari, farmatsevtik tortmalar va retseptiv kassa oynalari.",
    defaultDimensions: { width: 7, length: 9, height: 3.0 },
    defaultBudget: 22000,
    color: '#0284c7', // Sky Blue
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
    equipmentPresets: {
      economy: [
        { id: 'ph_wall', name: 'Dori Javoni (Shishali)', count: 6, unitPrice: 220, color: '#38bdf8', width: 1.2, depth: 0.4, height: 2.2, type: 'wall_shelf' },
        { id: 'ph_counter', name: 'Farmatsevt Kassa Stoli', count: 1, unitPrice: 450, color: '#0284c7', width: 1.8, depth: 0.7, height: 1.0, type: 'counter' }
      ],
      standard: [
        { id: 'ph_wall', name: 'Dori Javoni (Shishali)', count: 9, unitPrice: 260, color: '#38bdf8', width: 1.3, depth: 0.4, height: 2.3, type: 'wall_shelf' },
        { id: 'ph_drawer', name: 'Farmatsevtik Tortmalar Raki', count: 2, unitPrice: 650, color: '#0c4a6e', width: 1.5, depth: 0.6, height: 1.8, type: 'drawer' },
        { id: 'ph_counter', name: 'Shisha Retseptiv Kassa Stoli', count: 2, unitPrice: 600, color: '#0284c7', width: 2.0, depth: 0.7, height: 1.05, type: 'counter' }
      ],
      premium: [
        { id: 'ph_wall', name: 'Dori LED Vitrinasi', count: 12, unitPrice: 350, color: '#7dd3fc', width: 1.4, depth: 0.4, height: 2.4, type: 'wall_shelf' },
        { id: 'ph_drawer', name: 'Avtomatlashtirilgan Tortmalar Raki', count: 4, unitPrice: 950, color: '#0369a1', width: 1.6, depth: 0.6, height: 2.0, type: 'drawer' },
        { id: 'ph_counter', name: 'Express Kassa va Maslahat Bar', count: 2, unitPrice: 850, color: '#0c4a6e', width: 2.2, depth: 0.8, height: 1.1, type: 'counter' }
      ]
    },
    inventoryPricePerM2: 180,
    renovationPricePerM2: 90,
  },
  {
    id: 'autoparts',
    name: 'Avto Ehtiyot Qismlari va Asboblar',
    icon: 'Wrench',
    badge: 'Industrial',
    description: "Og'ir metall stellajlar, shinatsiz stendlar, moy va filtrlar vitrinasi va xizmat stoli.",
    defaultDimensions: { width: 10, length: 14, height: 3.5 },
    defaultBudget: 30000,
    color: '#ea580c', // Orange Red
    gradient: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
    equipmentPresets: {
      economy: [
        { id: 'ap_rack', name: 'Metall Og\'ir Stellaj', count: 6, unitPrice: 300, color: '#374151', width: 1.8, depth: 0.6, height: 2.4, type: 'wall_shelf' },
        { id: 'ap_tire_stand', name: 'Shinalar Stendi', count: 2, unitPrice: 250, color: '#1f2937', width: 1.5, depth: 0.7, height: 2.0, type: 'tire_stand' },
        { id: 'ap_counter', name: 'Avto Kassa Stoli', count: 1, unitPrice: 400, color: '#9a3412', width: 1.8, depth: 0.8, height: 1.0, type: 'counter' }
      ],
      standard: [
        { id: 'ap_rack', name: 'Metall Og\'ir Stellaj', count: 10, unitPrice: 350, color: '#374151', width: 2.0, depth: 0.6, height: 2.5, type: 'wall_shelf' },
        { id: 'ap_tire_stand', name: 'Shinalar Stendi (Vertikal)', count: 4, unitPrice: 320, color: '#1f2937', width: 1.8, depth: 0.7, height: 2.2, type: 'tire_stand' },
        { id: 'ap_oil_display', name: 'Moylar va Suyuqliklar Vitrinasi', count: 3, unitPrice: 280, color: '#f97316', width: 1.5, depth: 0.5, height: 2.0, type: 'oil_display' },
        { id: 'ap_counter', name: 'Zapchast Kassa Bar', count: 1, unitPrice: 600, color: '#7c2d12', width: 2.2, depth: 0.9, height: 1.0, type: 'counter' }
      ],
      premium: [
        { id: 'ap_rack', name: 'Industrial Og\'ir Metall Raking', count: 14, unitPrice: 450, color: '#111827', width: 2.4, depth: 0.7, height: 2.8, type: 'wall_shelf' },
        { id: 'ap_tire_stand', name: 'Disk va Shinalar Stendi', count: 6, unitPrice: 420, color: '#0f172a', width: 2.0, depth: 0.8, height: 2.4, type: 'tire_stand' },
        { id: 'ap_oil_display', name: 'LED Moylar Vitrinasi', count: 5, unitPrice: 380, color: '#fb923c', width: 1.8, depth: 0.5, height: 2.2, type: 'oil_display' },
        { id: 'ap_counter', name: 'Professional Service Desk', count: 2, unitPrice: 900, color: '#431407', width: 2.5, depth: 1.0, height: 1.05, type: 'counter' }
      ]
    },
    inventoryPricePerM2: 220,
    renovationPricePerM2: 70,
  },
  {
    id: 'flowers',
    name: 'Gullar va Sovg\'alar Do\'koni',
    icon: 'Flower2',
    badge: 'Boutique',
    description: "Gullar stendi, sovutgichli floristik shisha xona, sovg'alar o'rash stoli va ko'rgazma raklari.",
    defaultDimensions: { width: 6, length: 8, height: 3.0 },
    defaultBudget: 14000,
    color: '#14b8a6', // Teal / Emerald Accent
    gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    equipmentPresets: {
      economy: [
        { id: 'fl_stand', name: 'Gullar Pog\'onali Stendi', count: 4, unitPrice: 180, color: '#2dd4bf', width: 1.2, depth: 0.6, height: 1.2, type: 'flower_stand' },
        { id: 'fl_wrap_table', name: 'Gullarni O\'rash Stoli', count: 1, unitPrice: 300, color: '#0f766e', width: 1.5, depth: 0.8, height: 0.9, type: 'table' },
        { id: 'fl_cash', name: 'Florist Kassa Stoli', count: 1, unitPrice: 350, color: '#134e4a', width: 1.4, depth: 0.6, height: 1.0, type: 'counter' }
      ],
      standard: [
        { id: 'fl_cold_room', name: 'Sovutgichli Shisha Gul Xonasi', count: 1, unitPrice: 2800, color: '#99f6e4', width: 2.5, depth: 2.0, height: 2.4, type: 'cold_room' },
        { id: 'fl_stand', name: 'Yog\'och Gul Stendlari', count: 5, unitPrice: 240, color: '#2dd4bf', width: 1.4, depth: 0.7, height: 1.3, type: 'flower_stand' },
        { id: 'fl_gift_shelf', name: 'Sovg\'alar Vitrinasi', count: 3, unitPrice: 250, color: '#5eead4', width: 1.2, depth: 0.4, height: 2.0, type: 'wall_shelf' },
        { id: 'fl_wrap_table', name: 'Florist O\'rash Bar', count: 1, unitPrice: 450, color: '#0f766e', width: 1.8, depth: 0.9, height: 0.95, type: 'table' }
      ],
      premium: [
        { id: 'fl_cold_room', name: 'Panoramik LED Shisha Gul Xonasi', count: 1, unitPrice: 4200, color: '#ccfbf1', width: 3.0, depth: 2.5, height: 2.5, type: 'cold_room' },
        { id: 'fl_stand', name: 'Dizaynerlik Gul Podstavkalari', count: 8, unitPrice: 320, color: '#2dd4bf', width: 1.5, depth: 0.7, height: 1.4, type: 'flower_stand' },
        { id: 'fl_gift_shelf', name: 'Sovg\'alar va Dekor Vitrinasi', count: 5, unitPrice: 350, color: '#5eead4', width: 1.5, depth: 0.4, height: 2.2, type: 'wall_shelf' },
        { id: 'fl_wrap_table', name: 'Marmar Florist Workstation', count: 1, unitPrice: 750, color: '#134e4a', width: 2.2, depth: 1.0, height: 0.95, type: 'table' }
      ]
    },
    inventoryPricePerM2: 90,
    renovationPricePerM2: 85,
  },
  {
    id: 'books',
    name: 'Kitob va Kantselyariya Do\'koni',
    icon: 'BookOpen',
    badge: 'Education',
    description: "Kitob javonlari, mutolaa stoli, kantselyariya spinner stendlari va bolalar kitoblari burchagi.",
    defaultDimensions: { width: 8, length: 10, height: 3.0 },
    defaultBudget: 16000,
    color: '#6366f1', // Indigo
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    equipmentPresets: {
      economy: [
        { id: 'bk_shelf', name: 'Kitob Stellaji', count: 8, unitPrice: 200, color: '#818cf8', width: 1.2, depth: 0.4, height: 2.2, type: 'wall_shelf' },
        { id: 'bk_stationery', name: 'Kantselyariya Stendi', count: 2, unitPrice: 180, color: '#a5b4fc', width: 1.0, depth: 0.5, height: 1.8, type: 'island_shelf' },
        { id: 'bk_cash', name: 'Kassa Stoli', count: 1, unitPrice: 350, color: '#3730a3', width: 1.5, depth: 0.7, height: 1.0, type: 'counter' }
      ],
      standard: [
        { id: 'bk_shelf', name: 'Yog\'och Kitob Stellaji', count: 12, unitPrice: 260, color: '#818cf8', width: 1.3, depth: 0.4, height: 2.3, type: 'wall_shelf' },
        { id: 'bk_island', name: 'Top-Seller Kitoblar Oroli', count: 3, unitPrice: 320, color: '#c7d2fe', width: 1.6, depth: 0.8, height: 1.2, type: 'island_shelf' },
        { id: 'bk_stationery', name: 'Kantselyariya Spinner Stendi', count: 4, unitPrice: 240, color: '#a5b4fc', width: 1.0, depth: 0.6, height: 1.8, type: 'island_shelf' },
        { id: 'bk_read_table', name: 'Mutolaa Stoli va Stullar', count: 2, unitPrice: 380, color: '#4338ca', width: 1.8, depth: 0.9, height: 0.8, type: 'table' },
        { id: 'bk_cash', name: 'Butilka Kassa Stoli', count: 1, unitPrice: 500, color: '#312e81', width: 1.8, depth: 0.8, height: 1.0, type: 'counter' }
      ],
      premium: [
        { id: 'bk_shelf', name: 'Premium Yog\'och Kitob Stellajlari', count: 16, unitPrice: 350, color: '#6366f1', width: 1.5, depth: 0.4, height: 2.5, type: 'wall_shelf' },
        { id: 'bk_island', name: 'Top-Seller LED Kitoblar Oroli', count: 5, unitPrice: 450, color: '#e0e7ff', width: 1.8, depth: 0.9, height: 1.3, type: 'island_shelf' },
        { id: 'bk_stationery', name: 'Kantselyariya Vitrina Moduli', count: 6, unitPrice: 320, color: '#a5b4fc', width: 1.2, depth: 0.6, height: 1.9, type: 'island_shelf' },
        { id: 'bk_read_table', name: 'Book-Cafe Mutolaa Zoni (Stol+Sofa)', count: 3, unitPrice: 650, color: '#4338ca', width: 2.0, depth: 1.0, height: 0.85, type: 'table' },
        { id: 'bk_cash', name: 'Bookstore Reception Desk', count: 1, unitPrice: 850, color: '#1e1b4b', width: 2.2, depth: 0.9, height: 1.05, type: 'counter' }
      ]
    },
    inventoryPricePerM2: 110,
    renovationPricePerM2: 75,
  }
];
