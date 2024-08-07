import axios from 'axios';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import("@whiskeysockets/baileys")).default;

let handler = async (message, { conn, text }) => {
    if (!text) return conn.reply(message.chat, '*> البحث في تيكوتك*', message);

    async function createAudioMessage(url, index) {
        const videoPath = `./tmp/video_${index}.mp4`;
        const audioPath = `./tmp/audio_${index}.mp3`;
        const writer = fs.createWriteStream(videoPath);

        const response = await axios.get(url, { responseType: 'stream' });
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .output(audioPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        const audioBuffer = fs.readFileSync(audioPath);
        
        // حذف الملفات المؤقتة بعد الاستخدام
        fs.unlinkSync(videoPath);
        fs.unlinkSync(audioPath);

        return audioBuffer;
    }

    async function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    try {
        let results = [];
        let { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${text}`);
        let searchResults = response.data;
        shuffleArray(searchResults);
        let selectedResults = searchResults.splice(0, 4);

        // تحميل الفيديوهات واستخراج الصوتيات بشكل متوازي
        const audioBuffers = await Promise.all(selectedResults.map((result, index) => createAudioMessage(result.nowm, index)));

        for (let i = 0; i < selectedResults.length; i++) {
            const result = selectedResults[i];
            const audioMessage = {
                audio: audioBuffers[i],
                fileName: `audio_${i}.mp3`,
                mimetype: 'audio/mpeg'
            };
            await conn.sendMessage(message.chat, audioMessage, { quoted: message });
        }
    } catch (error) {
        await conn.reply(message.chat, error.toString(), message);
    }
};

handler.help = ['tio <txt>'];
handler.tags = ['buscador'];
handler.command = ['tio'];
export default handler;