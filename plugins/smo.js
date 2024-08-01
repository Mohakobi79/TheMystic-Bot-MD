import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';
import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix: prefijo }) => {
 const datas = global;
 const device = await getDevice(m.key.id);

 if (!text) throw `⚠️ *hi *`;

 const results = await yts(text);
 const videos = results.videos.slice(0, 20); // أخذ أول 20 فيديو

 if (device !== 'desktop' || device !== 'web') {
 const messa = await prepareWAMessageMedia({ image: { url: videos[0].thumbnail } }, { upload: conn.waUploadToServer });
 const interactiveMessage = {
 body: {
 text: `*—◉ نتائج البحث:* ${results.videos.length}\n\n*—◉ اختر أغنية:*\n`,
 },
 footer: { text: `${global.wm}`.trim() },
 header: {
 title: `*< بحث يوتيوب />*\n`,
 hasMediaAttachment: true,
 imageMessage: messa.imageMessage,
 },
 nativeFlowMessage: {
 buttons: [{
 name: 'single_select',
 buttonParamsJson: JSON.stringify({
 title: 'اختيارات متاحة',
 sections: [{
 title: 'اختر أغنية',
 rows: videos.map((video, index) => ({
 header: video.title,
 title: video.author.name,
 description: 'تنزيل الصوت',
 id: `${prefijo}play.1 ${video.url}` // استخدم video.videoId بدلاً من video.url
 }))
 }]
 })
 }],
 messageParamsJson: ''
 }
 };

 let msg = generateWAMessageFromContent(m.chat, {
 viewOnceMessage: {
 message: {
 interactiveMessage,
 },
 },
 }, { userJid: conn.user.jid, quoted: m });

 conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
 } else {
 const teks = videos.map((v, index) => {
 return `
° *_${v.title}_*
↳ 🫐 *_رابط:* ${v.url}
↳ 🕒 *_المدة:* ${v.timestamp}
↳ 📥 *_منذ:* ${v.ago}
↳ 👁 *_المشاهدات:* ${v.views}`;
 }).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');

 conn.sendFile(m.chat, videos[0].thumbnail, 'error.jpg', teks.trim(), m);
 }
};

handler.help = ['ytsearch <texto>'];
handler.tags = ['search'];
handler.command = /^smo$/i;

export default handler;