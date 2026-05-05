# Bot Navyz

Bot WhatsApp pribadi yang dirancang khusus dengan kepribadian **Navyz (Navus)** untuk menemani sang kekasih, **Natasya**, agar tidak merasa kesepian saat sedang beristirahat atau ketiduran.

## Latar Belakang
Proyek ini dibuat dengan cinta karena saya tidak ingin my pacar gwe merasa kesepian saat saya pergi berperang (ketiduran). Bot ini hadir sebagai "ma twin" yang memiliki gaya bicara, kepribadian, sampe kebiasaan unik diriku, sehingga my pacar gwe tetap merasa ditemani kapanpun.

## Teknologi yang Digunakan
*   **Engine:** Node.js (Runtime JavaScript).
*   **WhatsApp Core:** `whatsapp-web.js` (Library untuk menghubungkan WhatsApp Web).
*   **AI Brain:** `Google Gemini AI` (Menggunakan SDK `@google/generative-ai`).
*   **Models:** 
    *   **Primary:** `gemini-flash-latest` (Cepat dan Pintar).
    *   **Fallback:** `gemini-flash-lite-latest` (Cadangan otomatis jika kuota utama limit).
*   **Storage:** File System (JSON) untuk menyimpan history chat dan data stiker.

## Fitur Utama
*   **Hybrid Model System:** Otomatis pindah ke model cadangan (Lite) jika model utama terkena limit (Error 429).
*   **Personality Sync:** Mengikuti instruksi gaya bicara Navus (sedikit cuek tapi sayang, cemburuan, clingy, dan sering emoji).
*   **Memory History:** Mengingat 30 pesan terakhir agar obrolan tetap nyambung.
*   **Sticker Store:** Bisa menyimpan stiker WhatsApp kesukaan (termasuk stiker jomok) dan mengirimnya otomatis.
*   **Security Whitelist:** Hanya membalas nomor yang terdaftar di `.env`.

## Cara Penggunaan

### 1. Persiapan Lingkungan
Pastikan komputer Kakak sudah terpasang:
*   [Node.js](https://nodejs.org/) (Versi terbaru sangat disarankan).
*   Google Gemini API Key (Bisa didapat di [Google AI Studio](https://aistudio.google.com/)).

### 2. Instalasi Package
Buka terminal di folder proyek ini dan jalankan perintah berikut untuk menginstal semua library yang dibutuhkan:
```bash
npm install whatsapp-web.js qrcode-terminal @google/generative-ai dotenv
```

### 3. Konfigurasi API & Nomor (.env)
Buat file bernama `.env` di folder utama dan isi seperti ini:
```env
GEMINI_API_KEY={API GEMINI KAMU}
# NAMA DI SETTINGAN WA BUKAN NAMA SAVE
TARGET_PHONE_NUMBER={NAMA DI SETTINGAN WA}
```

### 4. Menjalankan Bot
```bash
node index.js
```
*   Tunggu sampai QR Code muncul.
*   Scan pakai WhatsApp nomor yang mau dijadikan bot contoh (**085142506345**).
*   Jika muncul tulisan `Bot sudah siap dan online!`, berarti Navus sudah redy.

### 5. Cara Ajarin Stiker
Cukup kirim stiker di WhatsApp, lalu **Reply/Balas** stiker tersebut dengan mengetik:
`!simpan [nama_stiker]`
*Contoh: !simpan jomok*

---

I HEART NATASYA ❤️