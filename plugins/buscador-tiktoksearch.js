import axios from 'axios';
const { proto, generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent } = (await import("@whiskeysockets/baileys")).default;

let handler = async (message, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(message.chat, '*> البحث في تيكوتك*', message);

    async function createVideoMessage(url) {
        const { videoMessage } = await generateWAMessageContent({ video: { url } }, { upload: conn.waUploadToServer });
        return videoMessage;
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

        // تحميل الفيديوهات بشكل متوازي
        const videoMessages = await Promise.all(selectedResults.map(result => createVideoMessage(result.nowm)));

        for (let i = 0; i < selectedResults.length; i++) {
            let result = selectedResults[i];
            results.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: wm }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: result.title,
                    hasMediaAttachment: true,
                    videoMessage: videoMessages[i] // استخدام الفيديو المحمل
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
            });
        }

        const responseMessage = generateWAMessageFromContent(message.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({ text: `نتائج بحثك هذه 📥: ${text}` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: '🔎 `K O B U - B O T 📥`' }),
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...results] })
                    })
                }
            }
        }, { quoted: message });

        await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id });
    } catch (error) {
        await conn.reply(message.chat, error.toString(), message);
    }
};

handler.help = ['tiktoksearch <txt>'];
handler.tags = ['buscador'];
handler.command = ['tik', 'tkob', 'tiktoks'];
export default handler;