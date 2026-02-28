import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface UserPayload {
  id: number
  username: string
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  // logging for debugging
  console.log('Auth Middleware - Authorization Header:', authHeader)

  if (!authHeader?.startsWith('Bearer ')) // log if header is missing or malformed
  { 
    console.log(`No valid Authorization header found. Expected format: 'Bearer <token>'. Received: ${authHeader}`)
    return next()
  }

const token = authHeader.split(' ')[1]!

try {
  const secretKey = process.env.JWT_SECRET || 'supersecret123'
  const payload = jwt.verify(token, secretKey) as unknown as UserPayload
  req.user = payload
  // log the decoded payload for debugging
  console.log('Auth Middleware - Decoded JWT Payload:', payload.username)
} catch (err) {
  // log the error for debugging
  console.log('Auth Middleware - JWT verification failed:', err)
  req.user = undefined
}

  next()
}

export default authMiddleware