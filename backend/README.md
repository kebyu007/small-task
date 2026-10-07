# Nasiya Savdo Mini-Tizimi

Kredit savdo uchun backend tizimi. Barcha topshiriqlar, jumladan qoldiq (tiyin) hisoblari, xavfsiz tranzaksiyalar va RabbitMQ Worker integratsiyasi amalga oshirilgan.

## Ishga tushirish qadamlari

### 1. Talablar
Tizimingizda quyidagilar o'rnatilgan bo'lishi kerak:
- Node.js (v18+)
- PostgreSQL
- Redis
- RabbitMQ

### 2. O'rnatish
```bash
# Loyihani klonlab olish yoki papkaga kirish
cd task

# Kutubxonalarni o'rnatish
npm install
```

### 3. Muhit o'zgaruvchilari (Environment)
Fayl bazasida `.env` (agar yo'q bo'lsa `.env.example` dan nusxa olib yarating) faylini ochib kerakli ma'lumotlarni o'zingizga moslang:
```env
PORT=3000
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost
DB_NAME=smalltask
DB_USER=kebyu
DB_PASSWORD=7007
DB_HOST=localhost
DB_PORT=5432
REDIS_TTL=3600
```

### 4. Baza (Migratsiya)
Barcha 7 ta jadval va Indexlarni avtomatik yaratish uchun quyidagi buyruqni bering:
```bash
npm run migrate
```

### 5. Dasturni ishga tushirish
Loyihada 2 ta asosiy mexanizm mavjud: API va Background Worker. Ikkalasini ham 2 ta alohida terminal oynasida yurgizing:

**1-oyna (Asosiy API server):**
```bash
npm run start:dev
```

**2-oyna (RabbitMQ Worker):**
```bash
npm run start:worker
```

**Unit Testlarni tekshirish:**
Oylik grafiklarni to'g'ri ishlashini tekshiradigan 5 ta majburiy testlarni ko'rish uchun:
```bash
npm run test
```

**Eslatma Skripti (Cron Job)**
3 kun qolgan to'lovlarni axtarib mijozlarga eslatma SMS (bildirishnoma) yozadigan skript:
```bash
npm run remind
```

---

## Nimalar qilingan? (Barchasi)
- Tranzaksiyalar (`BEGIN`, `COMMIT`, `ROLLBACK`) yordamida shartnoma yozish va to'lov xavfsizligi.
- Pulingiz havoga uchib ketmasligi uchun tiyinlarning aniq va to'g'ri (oxirgi oyga qo'shiladigan) matematik taqsimoti.
- RabbitMQ (Xabarlar navbati) yordamida SMS/Bildirishnomalarni 0 kuttirish (async) bilan bazaga yozish.
- Tariflar keshini Redis da ushlash. Redis uzilib qolsa ham qulab tushmasdan ishlashda davom etish qobiliyati.
- Idempotency (`idempotency_key` orqali) xaridor internet qotganda 2 marta to'lab yuborishini oldini olish.
- 5 million qatorlik jadval tez ishlashi uchun maxsus Index.

## Nima qilinmagan?
- *Front-End qismi. Loyiha faqat Backend stajer uchun tuzilgan bo'lib, hamma narsa API orqali Postman'da boshqariladi.*
- *Bir vaqtdalik testi (Parallel requests) avtomatlashtirilgan skript bilan qilinmadi, lekin kod qismida FOR UPDATE ishlatilib bloklash qo'lda ishlangan.*
