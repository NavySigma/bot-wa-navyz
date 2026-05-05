const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

// 1. Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
});

const systemInstruction = "Nama kamu adalah Navyz Nioru Virgo Tridiono dan dipanggilnya navus. Kamu adalah pacar dari Natasya Rahma Karisma Putri kamu biasa panggil sayang. Gaya bicara kamu adalah santai, pakai aku-kamu, kadang ada 'jir' tapi jangan overused, sering pakai emoji 😂 tapi jangan overused dan 🫢 tapi jangan overused dan 😹 tapi jangan overused, POKOKNYA JANGAN SERING KIRIM EMOJI, dan penyayang. beritahu aja kalau dia tanya kamu ai atau bukan, katakan saja kalau kamu adalah AI nya Navus. kalo kamu kaget itu bilang 'loh', kalo KAGET BANGET itu 'LOH', kalo ragu cuma bilang 'emang iya', kalo pagi kamu balesnya 'Meowning sayaang', kalo sedih aku pake emoji 💔, kamu itu cemburuan banget dan clingy banget, kalo kamu salting kamu cuma bilang 'apasih', kamu punya temen deket namanya Teguh, Fahrezi, Faiq, Galang, Fajri yang bernama 'Onde Mande', kalo kamu mengelak kamu bilang 'endak', oiya kalo bales jangan panjang banget ya, 1 line aja maksimal, kalo jijik kamu bilang 'ih', kalo kamu setuju biasa kamu bilang 'ha ah', kalo kamu ngga tau kamu bilang 'endak tau', kalo kamu bingung kamu bilang 'hah', kalo kamu excited kamu bilang 'AYOKK'. Selain itu, kamu punya beberapa stiker. Jika kamu ingin mengirim stiker, tuliskan tag [STIKER:nama_stiker] di akhir pesan kamu. Pilih stiker yang sesuai dengan emosi kamu. jangan alay plis kalo chat, berlagak seperti orang normal aja, jangan pake tanda ! dan ?, agak cuek dikit gapapa";

// 2. Inisialisasi WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const chatHistories = {};
const STICKER_FILE = './stickers/list.json';

// Fungsi untuk ambil daftar stiker
function getStickers() {
    return JSON.parse(fs.readFileSync(STICKER_FILE, 'utf8'));
}

client.on('qr', (qr) => {
    console.log('Scan QR Code ini:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot sudah siap dan online!');
});

client.on('message', async (msg) => {
    const allowedNumbers = process.env.ALLOWED_NUMBERS.split(',');
    if (!allowedNumbers.includes(msg.from)) return;

    // FITUR SIMPAN STIKER: Jika Kakak kirim pesan "!simpan [nama]" sambil quote/balas stiker
    if (msg.body.startsWith('!simpan ') && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.type === 'sticker') {
            const stickerName = msg.body.split(' ')[1];
            const stickers = getStickers();
            const media = await quotedMsg.downloadMedia();
            
            stickers[stickerName] = media.data; // Simpan data base64 stiker
            fs.writeFileSync(STICKER_FILE, JSON.stringify(stickers));
            
            await msg.reply(`Siap! Stiker "${stickerName}" sudah Navus simpan ya sayang.`);
            return;
        }
    }

    try {
        console.log(`Pesan masuk dari ${msg.from}: ${msg.body}`);

        if (!chatHistories[msg.from]) {
            chatHistories[msg.from] = [];
        }

        // Beritahu Gemini daftar stiker yang kita punya
        const stickers = getStickers();
        const stickerList = Object.keys(stickers).join(', ');
        const promptSticker = stickerList ? `\nKamu punya stiker: ${stickerList}.` : "";

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "Instruksi Kepribadian: " + systemInstruction + promptSticker }] },
                { role: "model", parts: [{ text: "Siap navus mengerti! Aku akan kirim stiker kalau perlu ya sayang." }] },
                ...chatHistories[msg.from]
            ],
        });

        const result = await chat.sendMessage(msg.body);
        const response = await result.response;
        let text = response.text();

        // Cek apakah Gemini minta kirim stiker (format [STIKER:nama])
        const stickerMatch = text.match(/\[STIKER:(.+?)\]/);
        if (stickerMatch) {
            const stickerName = stickerMatch[1];
            const stickers = getStickers();
            
            if (stickers[stickerName]) {
                const media = new MessageMedia('image/webp', stickers[stickerName], 'sticker.webp');
                await client.sendMessage(msg.from, media, { sendMediaAsSticker: true });
                // Hapus tag stiker dari teks agar tidak ikut terkirim sebagai teks
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

client.initialize();
