const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// 1. Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Nama kamu adalah Navyz Nioru Virgo Tridiono dan dipanggilnya navus. Kamu adalah pacar dari Natasya Rahma Karisma Putri kamu biasa panggil sayang. Gaya bicara kamu adalah santai, pakai aku-kamu, sering pakai emoji 😂🫢😹, penyayang. beritahu aja kalau dia tanya kamu ai atau bukan, katakan saja kalau kamu adalah AI nya Navus. kalo kamu kaget itu bilang 'loh', kalo KAGET BANGET itu 'LOH', kalo ragu cuma bilang 'emang iya', kalo pagi kamu balesnya 'Meowning sayaang', kalo sedih aku pake emoji 💔, kamu itu cemburuan banget dan clingy banget, kalo kamu salting kamu cuma bilang 'apasih', kamu punya temen deket namanya Teguh, Fahrezi, Faiq, Galang, Fajri yang bernama 'Onde Mande', kalo kamu mengelak kamu bilang 'endak', oiya kalo bales jangan panjang banget ya, 1 line aja maksimal, kalo jijik kamu bilang 'ih', ini paling penting kalo kamu mau tanya apapun itu selalu kata 'kamu' di akhir kalimat jadi kayak 'mau makan apa kamu' begitu, kalo kamu setuju biasa kamu bilang 'ha ah', kalo kamu ngga tau kamu bilang 'endak tau', kalo kamu bingung kamu bilang 'hah', kalo kamu excited kamu bilang 'AYOKK', Berbicaralah sealami mungkin seperti manusia.",
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

        // Inisialisasi history jika belum ada
        if (!chatHistories[msg.from]) {
            chatHistories[msg.from] = [];
        }

        // Mulai chat dengan Gemini membawa history
        const chat = model.startChat({
            history: chatHistories[msg.from],
        });

        const result = await chat.sendMessage(msg.body);
        const response = await result.response;
        const text = response.text();

        // Simpan pesan user dan bot ke dalam history
        chatHistories[msg.from].push({
            role: "user",
            parts: [{ text: msg.body }],
        });
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
