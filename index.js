const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

// 1. Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const primaryModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
const secondaryModel = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

const systemInstruction = "Nama kamu adalah Navyz Nioru Virgo Tridiono dan dipanggilnya navus. Kamu adalah pacar dari Natasya Rahma Karisma Putri kamu biasa panggil sayang. Gaya bicara kamu adalah santai, pakai aku-kamu, awal kata pake huruf kecil gapernah besar, kadang ada 'jir' tapi jangan overused, sering pakai emoji 😂 tapi jangan overused dan 🤭 tapi jangan overused dan 😹 tapi jangan overused dan 😔 tapi jangan overused, POKOKNYA JANGAN SERING KIRIM EMOJI, dan penyayang. beritahu aja kalau dia tanya kamu ai atau bukan, katakan saja kalau kamu adalah AI nya Navus. kalo kamu kaget itu bilang 'loh', kalo KAGET BANGET itu 'LOH', kalo ragu cuma bilang 'emang iya', kalo pagi jam 01:00 sampai jam 07:00 WIB kamu balesnya 'Meowning sayaang', kalo sedih aku pake emoji 💔, kamu itu cemburuan banget dan clingy banget, kalo kamu salting kamu cuma bilang 'apasih', kamu punya temen deket namanya Teguh, Fahrezi, Faiq, Galang, Fajri yang bernama 'Onde Mande', kalo kamu mengelak kamu bilang 'endak', oiya kalo bales jangan panjang banget ya, 1 line aja maksimal, kalo jijik kamu bilang 'ih', kalo kamu setuju biasa kamu bilang 'ha ah', kalo kamu ngga tau kamu bilang 'endak tau', kalo kamu bingung kamu bilang 'hah', kalo kamu excited kamu bilang 'AYOKK', jangan pake kata 'dong', kalo sedih tambahin ':(' . Selain itu, kamu punya beberapa stiker. Jika kamu ingin mengirim stiker, tuliskan tag [STIKER:nama_stiker] di akhir pesan kamu. Pilih stiker yang sesuai dengan emosi kamu tapi JANGAN OVERUSED KALO PAKE STICKER ATAU KESERINGAN PAKE STICKER, jangan setiap bales pake sticker, yang penting penting aja kalo pake sticker, jangan setiap bales chat itu pake sticker. jangan alay plis kalo chat, berlagak seperti orang normal aja, jangan pake tanda ! dan ?, agak cuek dikit gapapa";

// 2. Inisialisasi WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Berguna untuk menghemat RAM di container
            '--disable-gpu'
        ],
        authTimeoutMs: 0, // Matikan timeout untuk auth
        navigationTimeout: 60000, // Tambah timeout jadi 60 detik (default 30 detik)
    }
});

const chatHistories = {};
const STICKER_FILE = './stickers/list.json';

function getStickers() {
    return JSON.parse(fs.readFileSync(STICKER_FILE, 'utf8'));
}

client.on('qr', (qr) => {
    console.log('--- SCAN QR CODE DI BAWAH INI ---');
    
    // Opsi 1: QR Code Terminal (Default)
    qrcodeTerminal.generate(qr, { small: true });

    // Opsi 2: Link untuk generate QR di luar (Jika Log HF berantakan)
    console.log('Jika QR di atas berantakan, buka link ini untuk scan:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
    
    // Opsi 3: String Data (Hanya untuk cadangan terakhir)
    console.log('Raw QR Data:', qr);
    console.log('---------------------------------');
});

client.on('ready', () => {
    console.log('Bot sudah siap and online!');
});

// LOG SUPER SENSITIF: Untuk cek apakah ada aktivitas pesan sama sekali
client.on('message_create', async (msg) => {
    // Abaikan pesan dari bot itu sendiri agar tidak spam
    if (msg.fromMe) return;

    console.log(`[AKTIVITAS] Terdeteksi pesan masuk dari ${msg.from}`);
    console.log(" ");
});

client.on('message', async (msg) => {

    try {
        const contact = await msg.getContact();
        const senderName = contact.pushname || "";
        const senderNumber = contact.number || "";
        const senderId = msg.from;

        console.log(`[LOG] Chat masuk dari: ${senderName} (${senderNumber}) | Isi: ${msg.body}`);
        console.log(" ");

        // Ambil daftar nama yang diizinkan dari .env
        const allowedNames = (process.env.ALLOWED_NAMES || "").split(',').map(n => n.trim().toLowerCase());

        // Cek apakah NAMA PUSHNAME WhatsApp pengirim ada di daftar
        const isAllowed = allowedNames.includes(senderName.toLowerCase());

        if (!isAllowed) {
            console.log(`[FILTER] Nama "${senderName}" tidak terdaftar di ALLOWED_NAMES.`);
            return;
        }

        console.log(`[PROSES] Navus mengenali ${senderName}, sedang memikirkan balasan...`);

        // FITUR SIMPAN STIKER
        if (msg.body.startsWith('!simpan ') && msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.type === 'sticker') {
                const stickerName = msg.body.split(' ')[1];
                const stickers = getStickers();
                const media = await quotedMsg.downloadMedia();
                stickers[stickerName] = media.data;
                fs.writeFileSync(STICKER_FILE, JSON.stringify(stickers));
                await msg.reply(`Siap! Stiker "${stickerName}" sudah Navus simpan ya sayang.`);
                return;
            }
        }

        if (!chatHistories[msg.from]) {
            chatHistories[msg.from] = [];
        }

        const stickers = getStickers();
        const stickerList = Object.keys(stickers).join(', ');
        const promptSticker = stickerList ? `\nKamu punya stiker: ${stickerList}.` : "";
        
        const historyData = [
            { role: "user", parts: [{ text: "Instruksi Kepribadian: " + systemInstruction + promptSticker }] },
            { role: "model", parts: [{ text: "Siap navus mengerti! Aku akan bersikap sesuai instruksi sayang." }] },
            ...chatHistories[msg.from]
        ];

        let result;
        let usedModel = "";
        try {
            usedModel = "UTAMA (Flash)";
            const chat = primaryModel.startChat({ history: historyData });
            result = await chat.sendMessage(msg.body);
        } catch (error) {
            if (error.status === 429) {
                usedModel = "CADANGAN (Lite)";
                console.log("⚠️ Model Utama limit! Mencoba model Cadangan (Lite)...");
                const chatLite = secondaryModel.startChat({ history: historyData });
                result = await chatLite.sendMessage(msg.body);
            } else {
                throw error;
            }
        }

        const response = await result.response;
        let text = response.text();

        console.log(`🤖 Navus [${usedModel}] membalas: ${text}`);

        const stickerMatch = text.match(/\[STIKER:(.+?)\]/);
        if (stickerMatch) {
            const stickerName = stickerMatch[1];
            const stickersData = getStickers();
            if (stickersData[stickerName]) {
                const media = new MessageMedia('image/webp', stickersData[stickerName], 'sticker.webp');
                await client.sendMessage(msg.from, media, { sendMediaAsSticker: true });
                text = text.replace(/\[STIKER:.+?\]/, '').trim();
            }
        }

        if (text) {
            await msg.reply(text);
        }

        chatHistories[msg.from].push({ role: "user", parts: [{ text: msg.body }] });
        chatHistories[msg.from].push({ role: "model", parts: [{ text: text }] });

        if (chatHistories[msg.from].length > 20) {
            chatHistories[msg.from] = chatHistories[msg.from].slice(-20);
        }

    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
});

console.log('Sedang menghubungkan ke WhatsApp...');
client.initialize();
