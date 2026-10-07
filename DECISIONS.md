# DECISIONS.md (Qarorlar)

Topshiriqning 9-bo'limidagi Ochiq va Noaniq savollar ustida o'ylangan yechimlar hamda qabul qilingan qarorlar:

### 1. Qarorlar (9-bo'limdagi savollarga javoblar)

**Qaror 1: Shartnoma 31-yanvarda ochildi. Fevral, aprel to'lovlari qaysi sanaga tushadi?**
Oylik grafiklar chizishda Node.js ning standart `Date` ob'ektidan hamda `.setMonth(.getMonth() + 1)` xossasidan foydalanildi. U avtomatik tarzda oylarni (fevral 28 kunga, kabisa yilida 29 kunga) to'g'irlab hisoblaydi. Agar 31-Yanvarga 1 oy qo'shilsa bu kalendar bo'yicha 28 (yoki 29) Fevral yoki 2-Mart bo'lib tushadi. Bu esa o'zining "Native" tabiati bilan kunlar siljishining oldini oladi.

**Qaror 2: Mijoz qolgan qarzidan ko'p pul to'ladi. Rad etasizmi, ortiqchasini qaytarasizmi?**
- To'g'ridan to'g'ri xatolik bilan rad etiladi (`BadRequestException: Kiritilgan summa ortiqcha. Qarz miqdori: X`). Katta bazalarda ortiqcha summalar keyinchalik balans hisoblarida "osilib qoladi" va buktoriyaga bosh og'rig'i bo'ladi. Pul qaytarish funksiyasi topshiriqda yo'qligi sabab eng to'g'ri qaror — xato ko'rsatib butun tranzaksiyani bekor qilish (`ROLLBACK`) deb qabul qilindi.

**Qaror 3: Ikki kassir bir shartnomaga bir vaqtda to'lov kiritdi.**
- Tizimdagi "To'lov (pay)" API siga kirilganda dastlab shartnoma (contracts) hamda to'lov jadvali (schedule_items) ga aynan shu mijoz qatorlarini `SELECT ... FOR UPDATE` (Pessimistik blokirovka) qilib qulflab oldim. Qaysi kassir 1 millisekund oldinroq tugmani bossa o'sha bazani qulflab o'zgartiradi, ikkinchi kassir kutib turishga majbur bo'ladi. Xato o'tmaydi.

**Qaror 4: Mijozning limiti bitta shartnomaga yetadi, lekin bir vaqtda ikkita so'rov keldi.**
- Yuqoridagi 3-qadamning aynan o'zi shartnoma yaratish `POST /contracts` API sida ham qilingan. Shartnoma yaralishidan oldin mijozni `SELECT * FROM customers WHERE id = X FOR UPDATE` qilib qulflaydi va joriy qarzini hisoblab bo'lib ishi tugagach qulfni ochadi. Ikkita so'rov kelsa faqat bittasi yoziladi.

**Qaror 5: To'lov bazaga yozildi, lekin RabbitMQ shu payt ishlamayapti.**
- Bizdagi tizim tartibi: Oldin API to'liq o'z ishini tugatadi, bazaga `COMMIT` (saqlash) komandasi beriladi. Hamma ish tayyor bo'lgach eng oxirida RabbitMQ funksiyasi chaqiriladi. Agar u uzilib qolgan bo'lsa (yoki yoqilmagan bo'lsa), kod `try...catch` qilinganligi sababli dastur qulab tushmaydi, To'lov o'taveradi. Ammo o'sha damdagi xabar (bildirishnoma) yo'qoladi. Real loyihalarda buning ham oldini olish uchun xabarlar vaqtincha "outbox jadvali" ga yozib turiladi.

**Qaror 6: Idempotency-Key avvalgidek, lekin summa boshqa.**
- Bizdagi API mantiqiga ko'ra dastlab `idempotency_key` ni tekshiramiz. U bor bo'lsa darhol *"Bu to'lov oldin qilingan"* deb javob qaytaramiz (Summaga umuman qarab ham o'tirmaymiz, faqat kalitga qaraymiz). Va u muvaffaqiyatli xabar (200 OK) bilan yopiladi. Ya'ni bir xil kalit keldimi — xoh u boshqa summa bo'lsin, xoh to'g'ri bo'lsin umuman ishlamaydi. (Xavfsiz tomonga burilgan).

**Qaror 7: `schedule_items` da 5 mln qator bor. Kechikkanlar hisoboti uchun nima qilasiz?**
- Shunchaki oddiy SQL so'rov bilan yozilsa kompyuter (Baza) "Full Table Scan" (Hammasini bittalab ko'rib chiqish) rejimiga o'tib soatlab vaqt ketadi. Shu sababli `src/migrations/index.js` fayliga maxsus Composite Index (`CREATE INDEX idx_schedule_status_due_date ON schedule_items(status, due_date)`) qo'shdim. Natijada baza hamma joyni axtarmay o'zining tezkor b-tree daraxt xotirasidan shu ikki maydonga tushadiganlarini millisekundda suzib beradi.

### 2. Qiyinchiliklar
Qoldiq summalar bo'yicha: 10 ming so'mni 3 oyga bo'lgandagi havoga uchib ketadigan tiyinlarni alohida qoldiq qilib ushlab, eng oxirgi oy yopilishiga qadar olib borish alohida diqqat talab qildi (Avvaliga uni 1-oyga qo'shib yozilgan, keyinchalik PDF dagi talab yana bir o'qib chiqilib oxirgi oyga o'zgartirildi va Testlarda isbotlandi).

### 3. O'rganganlarim
Loyihada sof "ES Modules" hamda "pg" bilan to'g'ridan to'g'ri SQL kodlarni, asosiysi Tranzaksiyalar qanday nazorat qilinishini ishlatib ko'rdim. RabbitMQ uchun `amqplib` yordamida muloqot qilishning qulay mexanizmi (ayniqsa, ack / nack va prefetch(1) funksiyalarining mustahkam ishlashi) o'rganildi.

### 4. Yana bir hafta vaqt bo'lganda
- Barcha amallarni "Outbox pattern" ga aylantirardim. Tizim RabbitMQ ishlamay qolganda ma'lumot uzilishi holatlarini umuman to'xtatardi.
- Kechikkan mijozlar ustiga har kunlik penya hisoblaydigan (Cron Job) yozib chiqardim.
- API testlarini qo'shgan bo'lardim.
