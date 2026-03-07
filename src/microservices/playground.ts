import { textAnalysis } from './ai.ts'
import { logger } from '../microservices/logger.ts'

const texts = ['I love Canada!', 'The earth is flat']

for (const text of texts) {
  const sentiment = await textAnalysis(text)
  logger.info(text)
  logger.info(sentiment)
}
