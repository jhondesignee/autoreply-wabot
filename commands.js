import { Configuration, OpenAIApi } from "openai"
import { Storage, createFrame, splitCommand } from "./utils.js"

const config = new Storage("config.json")
const storage = new Storage("storage.json")
const configuration = new Configuration({
  apiKey: config.getItem("options").openAiApiKey
})
const openai = new OpenAIApi(configuration)
const frameStyle = {
  top: "════◄░░►════",
  bottom: "════◄░░►════",
  index: "•",
  gap: 1,
  pad: 0,
  rept: 1
}

export async function wa(context, rule) {
  return createFrame([
    "• *Web developer* •\n",
    "• *Programador* •\n",
    "• *Desenhista as vezes* •\n",
    "https://wa.me/message/O2NSJ44ZIVUEF1"
  ], {...frameStyle, ...{ index: "", gap: 0 }})
}

export async function inst(context, rule) {
  return createFrame([
    "• *Web developer* •\n",
    "• *Programador* •\n",
    "• *Desenhista as vezes* •\n",
    "https://instagram.com/pikacorderosa"
  ], {...frameStyle, ...{ index: "", gap: 0 }})
}

export async function menu(context, rule) {
  const menuMessage = [
    "*Comandos*\n",
    "*/ask [pergunta]* - Usar o ChatGPT",
    "*/wa* - Divulgar o WhatsApp",
    "*/inst* - Divulgar o Instagram",
    "*/menu* - Ver esse menu novamente"
  ]
  return createFrame(menuMessage, frameStyle)
}

export async function welcome(context, rule) {
  const welcomeMessage = [
    `Olá ${context.senderName}, meu nome é *Jhon*`,
    "Seu contato foi salvo com o nome do seu perfil\n",
    `Bot: ${config.getItem("options").botStatus ? "🟢" : "🔴"}`
  ]
  const contactList = storage.getItem("contactList", [], true)
  if (!contactList.includes(context.senderName)) {
    contactList.push(context.senderName)
    storage.setItem("contactList", contactList)
    const menu = await this.menu(context, rule)
    return [
      createFrame(welcomeMessage, frameStyle),
      menu
    ]
  }
}

export async function ask(context, rule) {
  const prompt = splitCommand(context.senderMessage)[1]
  if (!prompt) {
    return createFrame([
      "Execução do comando inválida",
      "Insira o texto após o comando"
    ], frameStyle)
  }
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 4000
  })
  return completion.data.choices[0].text
}

export async function onError(context, rule, error) {
  return createFrame([
    "Erro ao executar o comando :/\n: ",
    error.message
  ], frameStyle)
}

export async function onStart() {
  console.log("Bot started")
}