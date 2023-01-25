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

app.use(express.json())
app.use(cors())
app.post("/", async (request, response) => {
  const data = request.body
  if (/^\/ask/i.test(data?.senderMessage ?? "")) {
    const prompt = data.senderMessage.replace("/ask", "").trim()
    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        max_tokens: 4000,
        prompt
      })
      const result = completion.data.choices[0].text
      if (result) {
        response.send({
          data: [{
            message: result
          }]
        })
      } else {
        response.end() 
      }
    } catch(error) {
      if (error.response) {
        console.log(error.response.data)
      } else {
        console.log(error.message)
      }
      response.status(500).end()
    }
  } else {
    response.end()
  }
})
app.listen(process.env.PORT ?? 3000, () => {
  console.log("Server running")
})
