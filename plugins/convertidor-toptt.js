import { Shazam } from 'node-shazam';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
const shazam = new Shazam();

const handler = async (m) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language;
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`));
  const traductor = _translate.plugins.herramientas_whatmusic;

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (/audio|video/.test(mime)) {
    const media = await q.download();
    const ext = mime.split('/')[1];
    const filePath = `./tmp/${m.sender}.${ext}`;
    const audioFilePath = `./tmp/${m.sender}.opus`;
    fs.writeFileSync(filePath, media);

    // Extract audio from video and convert to opus
    if (/video/.test(mime)) {
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .output(audioFilePath)
          .audioCodec('libopus')
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
    } else {
      // Convert audio file to opus
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .output(audioFilePath)
          .audioCodec('libopus')
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
    }

    // Send the extracted audio clip as ptt
    const audioBuffer = fs.readFileSync(audioFilePath);
    await conn.sendMessage(m.chat, { audio: audioBuffer, fileName: `extracted.opus`, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m });

    fs.unlinkSync(filePath);
    fs.unlinkSync(audioFilePath);
  } else {
    throw traductor.texto4;
  }
};

handler.command = /^to$/i;
export default handler;