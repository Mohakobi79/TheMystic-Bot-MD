import fetch from 'node-fetch';

export async function before(m) {
    if (!m.text || !m.text.match(/facebook\.com|fb\.watch/i)) return false;

    const url = m.text.match(/(https?:\/\/[^\s]+)/)?.[0];
    if (!url) return;

    const sender = m.sender.split(`@`)[0];
    await m.reply('wait');

    try {
        const apiUrl = `https://widipe.com/download/fbdl?url=${encodeURIComponent(url)}`;
        let response = await fetch(apiUrl);
        let result = await response.json();

        if (!result || !result.status || !result.result || (!result.result.HD && !result.result.Normal_video)) {
            // Try the second API if the first one fails
            const backupApiUrl = `https://widipe.com/download/fbdown?url=${encodeURIComponent(url)}`;
            response = await fetch(backupApiUrl);
            result = await response.json();

            if (!result || !result.status || !result.result || !result.result.url) {
                throw 'Failed to fetch video details from both APIs';
            }

            const videoLink = result.result.url.isHdAvailable ? result.result.url.urls[0].hd : result.result.url.urls[1].sd;
            const videoBuffer = await fetch(videoLink).then(res => res.buffer());

            await conn.sendMessage(
                m.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                fileName: `video.mp4`,
                mentions: [m.sender],
            }, {
                quoted: m
            });
        } else {
            // Handle the first API response
            const videoLink = result.result.HD || result.result.Normal_video;
            const videoBuffer = await fetch(videoLink).then(res => res.buffer());

            await conn.sendMessage(
                m.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                fileName: `video.mp4`,
                mentions: [m.sender],
            }, {
                quoted: m
            });
        }
    } catch (error) {
        console.error('Handler Error:', error);
        conn.reply(m.chat, `An error occurred: ${error}`, m);
    }
}

export const disabled = false;