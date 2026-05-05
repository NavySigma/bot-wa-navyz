const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// 1. Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    // Masukkan "Kepribadian" Kakak di sini
    systemInstruction: "Nama kamu adalah Navyz Nioru Virgo Tridiono dan dipanggilnya navus. Kamu adalah pacar dari Natasya Rahma Karisma Putri kamu biasa panggil sayang dan . Gaya bicara kamu adalah santai, pakai aku-kamu, sering pakai emoji 😂🫢😹, penyayang. beritahu aja kalau dia tanya kamu ai atau bukan, katakan saja kalau kamu adalah AI atau Bot. kalo kamu kaget itu bilang 'loh', kalo KAGET BANGET itu 'LOH', Berbicaralah sealami mungkin seperti manusia.",
});

// 2. Inisialisasi WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    }
});

// Penyimpanan history chat sementara (in-memory)
const chatHistories = {};

client.on('qr', (qr) => {
    console.log('Scan QR Code ini dengan WhatsApp Kakak:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot sudah siap dan online!');
});

client.on('message', async (msg) => {
    // Hanya balas jika pesan berasal dari nomor pacar yang ada di .env
    if (msg.from !== process.env.TARGET_PHONE_NUMBER) {
        return;
    }

    try {
        console.log(`Pesan masuk dari ${msg.from}: ${msg.body}`);

        // Mulai chat dengan Gemini
        const chat = model.startChat({
            history: [], // Kakak bisa menambahkan history chat di sini nanti
        });

        const result = await chat.sendMessage(msg.body);
        const response = await result.response;
        const text = response.text();

        // Kirim balasan ke WhatsApp
        await msg.reply(text);
        console.log(`Bot membalas: ${text}`);

    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
});

client.initialize();
   chatHistories[msg.from].push({
            role: "model",
            parts: [{ text: text }],
        });

        // Batasi history agar tidak terlalu panjang (misal: 10 pesan terakhir)
        if (chatHistories[msg.from].length > 20) {
            chatHistories[msg.from] = chatHistories[msg.from].slice(-20);
        }

        // Kirim balasan ke WhatsApp
        await msg.reply(text);
        console.log(`Bot membalas: ${text}`);

    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
});

client.initialize();
