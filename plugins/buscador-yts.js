import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys'
import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix: prefijo }) => {
    const datas = global;
    
    const idioma = datas.db.data.users[m.sender].language;
    const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`));
    const traductor = _translate.plugins.buscador_yts;
    const device = await getDevice(m.key.id);

    if (!text) throw `*_SEARCH ♾️ ON YOUTUBE_*`;
await m.reply(wait);

    if (device !== 'desktop' || device !== 'web') {      

        const results = await yts(text);
        const videos = results.videos.slice(0, 20);
        const firstVideo = videos[0];

        var messa = await prepareWAMessageMedia({ image: {url: firstVideo.thumbnail}}, { upload: conn.waUploadToServer })
        const interactiveMessage = {
            body: { text: `> _*جاري التحميل●●●○○ 💠*_
> *_■■■■■■□□□□ 60% 𝚠𝚊𝚒𝚝!_*🌀`.trim() },  
            header: {
                title: `*< YouTube Search />*\n`,
                hasMediaAttachment: true,
                imageMessage: messa.imageMessage,
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: '📜إختر من القائمة 📜',
                            sections: videos.map((video) => ({
                                title: video.title,
                                rows: [
                                    {
                                        header: video.title,
                                        title: video.author.name,
                                        description: 'صوت 🎶',
                                        id: `${prefijo}play.1 ${video.url}`
                                    },
                                    {
                                        header: video.title,
                                        title: video.author.name,
                                        description: 'فيديو 📽',
                                        id: `${prefijo}play.2 ${video.url}`
                                    }
                                ]
                            }))
                        })
                    }
                ],
                messageParamsJson: ''
            }
        };        

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage,
                },
            },
        }, { userJid: conn.user.jid, quoted: m })
        conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id});

    } else {
        const datas = global;
        const idioma = datas.db.data.users[m.sender].language;
        const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`));
        const traductor = _translate.plugins.buscador_yts;      
        const results = await yts(text);
        const tes = results.all;
        const teks = results.all.map((v) => {
            switch (v.type) {
                case 'video': return `
° *_${v.title}_*
↳ 🫐 *_${traductor.texto2[0]}_* ${v.url}
↳ 🕒 *_${traductor.texto2[1]}_* ${v.timestamp}
↳ 📥 *_${traductor.texto2[2]}_* ${v.ago}
↳ 👁 *_${traductor.texto2[3]}_* ${v.views}`;
            }
        }).filter((v) => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');
        conn.sendFile(m.chat, tes[0].thumbnail, 'error.jpg', teks.trim(), m);      
    }    
};
handler.help = ['ytsearch <texto>'];
handler.tags = ['search'];
handler.command = /^yts$/i;
export default handler;