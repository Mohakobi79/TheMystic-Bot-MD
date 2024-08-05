import fg from "api-dylux"
import {
    youtubedl,
    youtubedlv2
} from "@bochilteam/scraper"
let limit = 80000

export async function before(m) {
const regex = (/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/)

const matches = (m.text.trim()).match(regex);
const spas = "                ";
if (!matches) return false;
await m.reply(wait);

    try {
                let q = "360p"
        let v = matches[0]
        const yt = await youtubedl(v).catch(async () => await youtubedlv2(v))
        const dl_url = await yt.video[q].download()
        const title = await yt.title
        const size = await yt.video[q].fileSizeH


        if (size.split("MB")[0] >= limit) return m.reply(` ≡  *التحميل من يوتوب*\n\n▢ *⚖️Size* : ${size}\n▢ *🎞️الجودة* : ${q}\n\n▢ _يتجاوز الملف حد التنزيل_ *+${limit} MB*`)
        let captvid = `
 ≡  *_التحميل من اليوتوب_*

🍀 : ${title}
📽 : mp4
⚖️: ${size}
`.trim()
let dls = "تم تنزيل المقطع بنجاح"
let doc = {
                video: {
                    url: dl_url
                },
                mimetype: "video/mp4",
                caption: captvid,
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        mediaType: 2,
                        mediaUrl: v,
                        title: title,
                        body: dls,
                        sourceUrl: v,
                        thumbnail: await (await this.getFile(yt.thumbnail)).data
                    }
                }
            }

            await this.sendMessage(m.chat, doc, {
                quoted: m
            })
            } catch (e) {
                await m.reply('error')
            }

}
export const disabled = false