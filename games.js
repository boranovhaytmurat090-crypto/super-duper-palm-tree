// EduPlay O'yinlari Ma'lumotlar Bazasi (Informatika)
const gamesData = [
  {
    id: 1,
    title: "Kompyuter qurilmalari",
    subtitle: "Juftlikni topish o'yini",
    description: "Kiritish va chiqarish qurilmalarini o'zlarining to'g'ri ta'riflari yoki vazifalari bilan juftlang. Har bir juftlik to'g'ri topsangiz ular yashil rangda birlashadi.",
    type: "matching",
    difficulty: "Oson",
    points: 100,
    data: {
      pairs: [
        { id: "p1", left: "Sichqoncha", right: "Kursor va buyruqlarni ekranda boshqarish" },
        { id: "p2", left: "Monitor", right: "Ma'lumotlar va tasvirlarni ekranda ko'rsatish" },
        { id: "p3", left: "Protsessor (CPU)", right: "Kompyuterning miyasi - barcha amallarni bajaradi" },
        { id: "p4", left: "Klaviatura", right: "Matn, sonlar va maxsus belgilarni kiritish" },
        { id: "p5", left: "Printer", right: "Raqamli hujjatlarni qog'ozga chop etish" },
        { id: "p6", left: "Skaner", right: "Qog'ozdagi rasm/hujjatni kompyuterga kiritish" }
      ]
    }
  },
  {
    id: 2,
    title: "Dasturiy ta'minot turlari",
    subtitle: "Kategoriyalarga ajratish",
    description: "Berilgan dasturlarni ularning turi bo'yicha to'g'ri guruhga (Tizimli yoki Amaliy) tortib o'tkazing.",
    type: "sorting",
    difficulty: "Oson",
    points: 100,
    data: {
      categories: [
        { id: "cat0", name: "Tizimli (System SW)" },
        { id: "cat1", name: "Amaliy (Application SW)" }
      ],
      items: [
        { id: "i1", name: "Windows 10 / 11", category: 0, desc: "Operatsion tizim" },
        { id: "i2", name: "Microsoft Word", category: 1, desc: "Matn muharriri" },
        { id: "i3", name: "Linux Ubuntu", category: 0, desc: "Operatsion tizim" },
        { id: "i4", name: "Google Chrome", category: 1, desc: "Veb-brauzer" },
        { id: "i5", name: "Kaspersky Antivirus", category: 0, desc: "Himoya dasturi" },
        { id: "i6", name: "Adobe Photoshop", category: 1, desc: "Grafik tahrirlovchi" },
        { id: "i7", name: "Android OS", category: 0, desc: "Mobil operatsion tizim" },
        { id: "i8", name: "Telegram Desktop", category: 1, desc: "Muloqot dasturi" }
      ]
    }
  },
  {
    id: 3,
    title: "Axborot va uning turlari",
    subtitle: "Millioner viktorinasi",
    description: "Axborotga oid qiziqarli savollarga javob bering va 1,000,000 ballik nishonni qo'lga kiriting. Sizda 50:50 va 'Farishta' (xatoni kechirish) yordamlari bor!",
    type: "quiz",
    difficulty: "Oson",
    points: 150,
    data: {
      questions: [
        {
          question: "Kompyuter xotirasida barcha ma'lumotlar qanday ko'rinishda saqlanadi?",
          options: ["Ikkilik kodda (0 va 1)", "O'nlik sanoq sistemasida", "Faqat ingliz alifbosida", "Tovush to'lqinlarida"],
          answer: 0,
          explanation: "Kompyuterlar tranzistorlardan tashkil topgani uchun ma'lumotlarni faqat 0 va 1 (tok yo'q/bor) shaklida saqlaydi."
        },
        {
          question: "Informatikada eng kichik axborot o'lchov birligi nima?",
          options: ["Bayt", "Kilobayt", "Bit", "Megabayt"],
          answer: 2,
          explanation: "Bit (binary digit) eng kichik birlik bo'lib, 0 yoki 1 qiymatini qabul qiladi."
        },
        {
          question: "1 Bayt necha bitga teng hisoblanadi?",
          options: ["4 bit", "8 bit", "1024 bit", "16 bit"],
          answer: 1,
          explanation: "Har doim 1 Bayt = 8 bit deb qabul qilingan."
        },
        {
          question: "Quyidagilardan qaysi biri axborotning taqdim etilish shakli emas?",
          options: ["Matnli", "Grafikli", "Plastmassali", "Tovushli"],
          answer: 2,
          explanation: "Plastmassa axborot shakli emas, balki jismoniy materialdir."
        },
        {
          question: "1 Megabayt (MB) taxminan qancha xotirani tashkil qiladi?",
          options: ["1000 Bayt", "1024 Kilobayt (KB)", "1024 Bayt", "1000 Gigabayt"],
          answer: 1,
          explanation: "Axborot o'lchov birliklari 2 ning darajalari bo'yicha oshadi, shuning uchun 1 MB = 1024 KB."
        }
      ]
    }
  },
  {
    id: 4,
    title: "Internet va xavfsizlik",
    subtitle: "To'g'ri yoki Noto'g'ri",
    description: "Internetda xavfsizlik va tarmoq qoidalari haqida berilgan fikrlarning to'g'ri (Yashil) yoki noto'g'riligini (Qizil) tezkor aniqlang.",
    type: "true_false",
    difficulty: "Oson",
    points: 100,
    data: {
      statements: [
        {
          text: "O'z parolingizni hammaga ko'rinadigan qog'ozga yozib qo'yish xavfsiz hisoblanadi.",
          isTrue: false,
          explanation: "Parol mutlaqo maxfiy bo'lishi kerak, aks holda hisobingizni osonlikcha buzishlari mumkin."
        },
        {
          text: "Sayt manzili boshida 'https://' bo'lsa, u sayt bilan ma'lumot almashish shifrlangan va xavfsiz bo'ladi.",
          isTrue: true,
          explanation: "'S' harfi 'Secure' ya'ni xavfsiz shifrlash protokolini anglatadi."
        },
        {
          text: "Internetda notanish odamlardan kelgan shubhali havolalarni (link) ochish mutlaqo xavfsiz.",
          isTrue: false,
          explanation: "Bunday havolalar kompyuterga virus yuqtirishi yoki shaxsiy ma'lumotlarni o'g'irlashi (fishing) mumkin."
        },
        {
          text: "Kuchli parol kamida 8 ta belgidan iborat bo'lib, harf, raqam va belgilar aralashmasidan tuziladi.",
          isTrue: true,
          explanation: "Bunday murakkab parollarni avtomatik taxmin qilish dasturlari osonlikcha topa olmaydi."
        },
        {
          text: "Barcha veb-saytlardagi ma'lumotlar 100% to'g'ri va ularni tekshirmasdan ishonish mumkin.",
          isTrue: false,
          explanation: "Internetda yolg'on yoki tekshirilmagan xabarlar juda ko'p. Ma'lumotni ishonchli manbadan tekshirish lozim."
        }
      ]
    }
  },
  {
    id: 5,
    title: "Algoritmlar ketma-ketligi",
    subtitle: "Qadamlarni tartiblash",
    description: "Dasturlashda yoki hayotda algoritm yaratish jarayonining to'g'ri ketma-ketligini yuqoridan pastga qarab tartiblang.",
    type: "ordering",
    difficulty: "Oson",
    points: 120,
    data: {
      items: [
        { id: "ord1", text: "1. Muammo yoki masalani aniq belgilab olish" },
        { id: "ord2", text: "2. Muammoni yechish algoritmini (rejasini) tuzish" },
        { id: "ord3", text: "3. Rejani blok-sxema ko'rinishida tasvirlash" },
        { id: "ord4", text: "4. Algoritmni dasturlash tilida kodga o'tkazish" },
        { id: "ord5", text: "5. Kodni ishga tushirish va xatolarini tuzatish (testlash)" }
      ]
    }
  },
  {
    id: 6,
    title: "Matn muharriri (MS Word)",
    subtitle: "Mini Krossvord",
    description: "MS Word matn muharririga oid asosiy atamalarni krossvord kataklariga to'g'ri harflar yozish orqali toping.",
    type: "crossword",
    difficulty: "Oson",
    points: 150,
    data: {
      size: 7,
      words: [
        {
          word: "KURSOR",
          clue: "Ekrandagi matn yoziladigan miltillovchi chiziqcha",
          x: 1, // 1-indexed column
          y: 2, // 1-indexed row
          dir: "H" // Horizontal
        },
        {
          word: "SHRIFT",
          clue: "Harflarning o'lchami va ko'rinish dizayni",
          x: 4,
          y: 1,
          dir: "V" // Vertical
        },
        {
          word: "ABZAS",
          clue: "Yangi satrdan boshlanuvchi matn qismi, chekinish bilan",
          x: 2,
          y: 5,
          dir: "H"
        },
        {
          word: "HURMAT",
          clue: "Biz matn yozganda mualliflik huquqiga ko'rsatadigan munosabatimiz (H...)",
          x: 2,
          y: 2,
          dir: "V"
        }
      ]
    }
  },
  {
    id: 7,
    title: "Elektron jadvallar (Excel)",
    subtitle: "Bo'shliqlarni to'ldirish",
    description: "Matndagi bo'sh qolgan o'rinlarga quyidagi javoblarni to'g'ri sudrab (drag-and-drop) o'tkazing.",
    type: "blanks",
    difficulty: "Oson",
    points: 120,
    data: {
      text: "MS Excel jadval protsessorida har bir katakcha ustun {1} va satr {2} kesishmasida hosil bo'ladi. Excelda formulalar har doim {3} belgisi bilan boshlanishi shart. Ustundagi sonlarni qo'shish uchun biz {4} funksiyasidan, o'rtacha arifmetik qiymatni hisoblash uchun esa {5} funksiyasidan foydalanamiz.",
      blanks: {
        "1": { answer: "harfi", placeholder: "ustun ..." },
        "2": { answer: "raqami", placeholder: "satr ..." },
        "3": { answer: "=", placeholder: "boshlanish belgisi" },
        "4": { answer: "SUM", placeholder: "qo'shish funksiyasi" },
        "5": { answer: "AVERAGE", placeholder: "o'rtacha funksiya" }
      },
      choices: ["harfi", "raqami", "=", "SUM", "AVERAGE", "MIN", "ko'paytirish", "Excel"]
    }
  },
  {
    id: 8,
    title: "Kompyuter tarmoqlari",
    subtitle: "Tarmoq xaritasini belgilash",
    description: "Tarmoq sxemasidagi tugmalarni bosib, u yerda qaysi qurilma joylashganini to'g'ri tanlang. Barcha qurilmalarni to'g'ri belgilash orqali g'olib bo'ling.",
    type: "labeling",
    difficulty: "Oson",
    points: 130,
    data: {
      nodes: [
        { id: "node1", name: "Router (Yo'naltirgich)", x: 50, y: 15, options: ["Router", "Klaviatura", "Printer", "Monitor"] },
        { id: "node2", name: "Switch (Kommutator)", x: 50, y: 48, options: ["Sichqoncha", "Switch", "Server", "Skaner"] },
        { id: "node3", name: "Server (Markaziy kompyuter)", x: 18, y: 78, options: ["Protsessor", "Router", "Server", "Kabel"] },
        { id: "node4", name: "Ishchi kompyuter (PC)", x: 50, y: 82, options: ["Ishchi kompyuter", "Switch", "Printer", "Modem"] },
        { id: "node5", name: "Tarmoq printeri", x: 82, y: 78, options: ["Muzlatgich", "Telefon", "Tarmoq printeri", "Server"] }
      ]
    }
  },
  {
    id: 9,
    title: "Dasturlash asoslari",
    subtitle: "Kod tahlili",
    description: "Quyida Scratch / Python tiliga o'xshash sodda dastur kodi berilgan. Kodning bajarilishini diqqat bilan kuzating va yakunda ekranga nima chiqishini toping.",
    type: "code_bug",
    difficulty: "Ortacha",
    points: 150,
    data: {
      code: `x = 5
takrorla 3 marta:
    x = x + 4
chop_et(x)`,
      question: "Dastur tugagandan so'ng, ekranga 'x' ning qanday qiymati chiqadi?",
      options: [
        "5 (Boshlang'ich qiymati)",
        "12 (3 marta 4 ko'paytirildi)",
        "17 (5 + 4 + 4 + 4 = 17)",
        "9 (Faqat 1 marta qo'shildi)"
      ],
      answer: 2,
      explanation: "Boshida x = 5. Sikl 3 marta aylanadi. Har safar x ga 4 qo'shiladi: 1-sikl: 9, 2-sikl: 13, 3-sikl: 17 bo'ladi."
    }
  },
  {
    id: 10,
    title: "Kiberxavfsizlik va Etika",
    subtitle: "So'z qidirish o'yini",
    description: "Harflar jadvali ichidan informatika va kiberxavfsizlikka oid 4 ta muhim so'zni toping. So'zlar ustiga bosib ularni belgilang (So'zlar: HAKER, VIRUS, PAROL, SPAM).",
    type: "word_search",
    difficulty: "Ortacha",
    points: 150,
    data: {
      grid: [
        ["H", "A", "K", "E", "R", "X", "Y", "Z"],
        ["V", "I", "R", "U", "S", "A", "B", "C"],
        ["P", "A", "R", "O", "L", "D", "E", "F"],
        ["S", "P", "A", "M", "G", "H", "I", "J"],
        ["Q", "W", "E", "R", "T", "Y", "U", "I"],
        ["O", "P", "A", "S", "D", "F", "G", "H"],
        ["J", "K", "L", "Z", "X", "C", "V", "B"],
        ["N", "M", "Q", "W", "E", "R", "T", "Y"]
      ],
      words: [
        { name: "HAKER", coords: [[0,0], [0,1], [0,2], [0,3], [0,4]] },
        { name: "VIRUS", coords: [[1,0], [1,1], [1,2], [1,3], [1,4]] },
        { name: "PAROL", coords: [[2,0], [2,1], [2,2], [2,3], [2,4]] },
        { name: "SPAM", coords: [[3,0], [3,1], [3,2], [3,3]] }
      ]
    }
  }
];
