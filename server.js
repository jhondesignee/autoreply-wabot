import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { Configuration, OpenAIApi } from "openai"

const app = express()
dotenv.config()
const configuration = new Configuration({
  apiKey: process.env.OPENAIKEY
})
const openai = new OpenAIApi(configuration)

app.use(cors())
app.use(express.json())
app.post("/", async (request, response) => {
  const data = request.body
  const isCommand = /^\/ask/i.test(data?.senderMessage ?? "")
  if (!isCommand) {
    return response.end()
  }
  const prompt = data.senderMessage.replace("/ask", "").trim()
  if (!prompt) {
    return response.send({
      data: [{ message: "Insira uma pergunta após o comando\n\nex.: /ask como resolver equação de segundo grau?" }]
    })
  } 
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 4000,
      prompt
    })
    const result = completion.data.choices[0].text
    response.send({
      data: [{ message: result }]
    })
  } catch(error) {
    console.log(error.response?.data ?? error.message)
    response.status(500).end()
  }
})
app.listen(process.env.PORT ?? 3000, () => {
  console.log("Bot running")
})
