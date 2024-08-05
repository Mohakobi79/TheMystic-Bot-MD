import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

export async function before(m) {
    if (!m.text || !m.text.match(/instagram\.com/i)) return false;

    const url = m.text.match(/(https?:\/\/[^\s]+)/)?.[0];
    if (!url) return;

    await m.reply(wait);

    try {
        let media = await igdl(url);
        if (media.length === 0) throw "🚩 No media found";
        let urls = media.map((a) => a.download);
        for (let i of urls) {
            await this.sendFile(m.chat, i, '', '', m);
        }
    } catch (e) {
        await m.reply(`حدث خطأ: ${e.message}`);
    }
}

export const disabled = false;

async function igdl(url) {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://v3.igdownloader.app/api/ajaxSearch',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': '*/*'
            },
            data: qs.stringify({
                recaptchaToken: '',
                q: url,
                t: 'media',
                lang: 'en'
            })
        });
        const $ = cheerio.load(response.data.data);
        const result = [];
        $('ul.download-box li').each((index, element) => {
            const thumbnail = $(element).find('.download-items__thumb img').attr('src');
            const options = [];
            $(element).find('.photo-option select option').each((i, opt) => {
                options.push({
                    resolution: $(opt).text(),
                    url: $(opt).attr('value')
                });
            });
            const download = $(element).find('.download-items__btn a').attr('href');

            result.push({
                thumbnail: thumbnail,
                options: options,
                download: download
            });
        });

        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch media');
    }
}