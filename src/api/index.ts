import type { Express } from 'express'
import { initializePostsAPI } from './posts'
import { initializeAuthAPI } from './auth'
import authMiddleware from './auth-middleware'
import { initializeMessageBroker } from '../message-broker'

export const initializeAPI = (app: Express) => {
    app.use(authMiddleware)
    initializePostsAPI(app)
    initializeAuthAPI(app)
    initializeMessageBroker()
}