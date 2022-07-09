import { Router } from 'express'

const testRouter = Router()

testRouter.get('/ping', (_, res) => {
  res.send('pong')
})

export default testRouter
