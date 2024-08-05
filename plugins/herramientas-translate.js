import translate from '@vitalets/google-translate-api'
import fetch from 'node-fetch'
let handler = async (m, { args, usedPrefix, command }) => {
let msg = `*هذا الأمر يمكنك من الترجمة الفورية لكل اللغات* 
_مثال اذا اردت الترجمة للعربية_ : 
*.tr* ar Hello`
if (!args || !args[0]) return m.reply(msg)  
let lang = args[0]
let text = args.slice(1).join(' ')
const defaultLang = 'ar'
if ((args[0] || '').length !== 2) {
lang = defaultLang
text = args.join(' ')}
if (!text && m.quoted && m.quoted.text) text = m.quoted.text
try {      
let result = await translate(`${text}`, { to: lang, autoCorrect: true })
await m.reply('🍀' + result.text)
} catch {
try {    
let lol = await fetch(`https://api.lolhuman.xyz/api/translate/auto/${lang}?apikey=85faf717d0545d14074659ad&text=${text}`)
let loll = await lol.json()
let result2 = loll.result.translated
await m.reply('*تفضل هذه ترجمتك سيدي \:* ' + result2)
} catch { 
await m.reply('*مشكلة أعد المحاولة لاحقا *')    
}}}
handler.help = ["translate"]
handler.tags = ["tools"]
handler.command = /^(translate|t)$/i
export default handler