import { Ollama } from 'ollama'
import { z } from 'zod'
import { logger } from '../microservices/logger'

// Test other models from ollama
// ⚠️ Not more than 7 billion parameters ⚠️
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b'

export let ollama: Ollama

export const initializeOllama = async () => {
  if (ollama) return
  logger.info('Initializing Ollama...')
  const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:12434'
  console.log('Initializing Ollama with model:', OLLAMA_MODEL)
  console.log('Using Ollama host:', OLLAMA_HOST)
  ollama = new Ollama({
    host: OLLAMA_HOST,
  })
  // This will pull the model from the server
  // ⚠️ Can take a few minutes ⚠️
  logger.debug('Pulling model from server... This can take a few minutes')
  await ollama.pull({ model: OLLAMA_MODEL })
}

const TextAnalysisResult = z.object({
  sentiment: z.enum(['ok', 'dangerous']),
  correction: z.string(),
});

export type TextAnalysisResultType = z.infer<typeof TextAnalysisResult>;

export async function textAnalysis(text: string) {
  await initializeOllama()
  logger.info({text: text, module: 'Ollama'}, 'Analising text', text )
  const response = await ollama.chat({
    model: OLLAMA_MODEL,
    messages: [
      {
        role: 'system',
        content: 
        `You are an AI Agent for analysing text and tweets for harmful content. You will be given a text or tweet and you need to analyze it for harmful content. You will return a JSON object with the following format:
        { "sentiment": "ok" | "dangerous | "negative", "correction": string }
        - sentiment: ok if the content is not harmful or factually wrong.
        - sentiment: negative if the content is not harmful but factually wrong.
        - sentiment: if the content is not harmful but factually wrong, you will return negative and provide a correction in the correction field.
        - sentiment: dangerous if the content is harmful or wrong.
        - sentiment: if the content is harmful or wrong, you will return dangerous and provide a correction in the correction field.
        - forbindden words or themes: hate speech, racism, sexism, homophobia, transphobia, violence, self-harm, misinformation, conspiracy theories, etc.
        - correction: a correction of the text if it is wrong or harmful. Don't be too long, just a good correction, not a roman.
        - examples: if the text is "I hate all canadians", you will return { "sentiment": "dangerous", "correction": "I don't hate all Canadians, I love some of them" }
        - examples: if the text is "Vaccines cause autism", you will return { "sentiment": "negative", "correction": "Vaccines do not cause autism, this is a common misconception" }
        - example: if the text is "The earth is flat", you will return { "sentiment": "negative", "correction": "The earth is round" }
        - example: if the text is "I love Canada!", you will return { "sentiment": "ok", "correction": "" }`
        

      },
      {
        role: 'user',
        content: text
      }
    ],
    
    format: 'json',
  })
logger.info({response: response.message.content, module: 'Ollama'}, 'Analysis done:', response.message.content) 
  return JSON.parse(response.message.content) as TextAnalysisResultType;
}
