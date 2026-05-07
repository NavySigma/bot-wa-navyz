---
title: Bot Navyz
emoji: ❤️
colorFrom: pink
colorTo: red
sdk: docker
pinned: false
---

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
    *   **Fallback:** `gemini-flash-lite-latest` (Cadangan otomatis jika kuota utama limit atau server sibuk).
*   **Storage:** File System (JSON) untuk menyimpan history chat dan data stiker.

## Fitur Utama
*   **Hybrid Model System:** Otomatis pindah ke model cadangan (Lite) jika model utama terkena limit atau server sibuk (Error 429/503).
*   **Personality Sync:** Mengikuti instruksi gaya bicara Navus (sedikit cuek tapi sayang, cemburuan, clingy, dan sering emoji).
*   **Memory History:** Mengingat 20 pesan terakhir agar obrolan tetap nyambung.
*   **Sticker Store:** Bisa menyimpan stiker WhatsApp kesukaan dan mengirimnya otomatis.
*   **Security Whitelist:** Hanya membalas nama WhatsApp yang terdaftar di environment.

## Cara Penggunaan (Hugging Face Deployment)

### 1. Persiapan Space
*   Buat Space baru di Hugging Face dengan SDK **Docker**.
*   Upload semua file proyek ini (kecuali `node_modules` dan `.env`).

### 2. Konfigurasi Secrets (PENTING)
Buka tab **Settings** > **Variables and secrets** di Space kamu, lalu tambahkan:
*   `GEMINI_API_KEY`: Kunci API Gemini kamu.
*   `ALLOWED_NAMES`: Daftar nama WhatsApp yang diizinkan (misal: `SIGMA, Natasya`).
*   `PAIRING_NUMBER`: Nomor HP bot kamu (contoh: `6285142506345`).

### 3. Menghubungkan WhatsApp (Pairing Code)
*   Buka tab **Logs** di Space kamu.
*   Tunggu sampai muncul **KODE TAUTAN ANDA** (8 digit).
*   Buka WhatsApp di HP > Perangkat Tertaut > Tautkan Perangkat.
*   Pilih **"Tautkan dengan nomor telepon saja"**.
*   Masukkan kode 8 digit yang muncul di Logs.

### 4. Cara Simpan Stiker
Cukup kirim stiker di WhatsApp, lalu **Reply/Balas** stiker tersebut dengan mengetik:
`!simpan [nama_stiker]`
*Contoh: !simpan jomok*

---

I HEART NATASYA ❤️
