import yts from "yt-search";
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
 let q, v, yt, dl_url, ttl, size;

 if (!text) throw `> ⓘ يرجى إدخال الأمر بشكل صحيح.\n> ${usedPrefix + command} اسم الأغنية أو البحث`;

 try {
 const waitMessage = await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } });
 await m.reply(wait);

 const yt_play = await search(args.join(" "));

 if (command === 'play') {
 const q = '128kbps';
 const v = yt_play[0].url;
 const yt = await youtubedl(v).catch(async _ => await youtubedlv2(v));
 const dl_url = await yt.audio[q].download();
 const ttl = await yt.title;
 const size = await yt.audio[q].fileSizeH;

 // إرسال الصورة المصغرة والعنوان
 const thumbMessage = await conn.sendMessage(m.chat, {
 image: { url: yt_play[0].thumbnail },
 caption: `📹 *${ttl}*`
 }, { quoted: m });

 // تشغيل المقطع الصوتي مباشرة عبر رابط التحميل
 await conn.sendMessage(m.chat, { audio: { url: dl_url }, mimetype: 'audio/mp4', ptt: true }, { quoted: m });

 // حذف الرسائل بعد دقيقة واحدة
 setTimeout(async () => {
     await conn.sendMessage(m.chat, { delete: waitMessage.key });
     await conn.sendMessage(m.chat, { delete: thumbMessage.key });
 }, 60000); // 60000 ميلي ثانية = 1 دقيقة
 }
 } catch (error) {
 console.error(error);
 throw 'حدث خطأ أثناء البحث عن الأغنية.';
 }
};

handler.command = ['play'];

export default handler;

async function search(query, options = {}) {
 const search = await yts.search({ query, hl: "it", gl: "IT", ...options });
 return search.videos;
}