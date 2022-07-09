import express, { Application } from 'express'
import cors from 'cors'
import { PORT } from './config/environment'
import testRouter from './routes/test.routes'

class Server {
  private app: Application

  constructor() {
    this.app = express()

    this.middlewares()
    this.routes()
  }

  private middlewares() {
    this.app.use(cors())
    this.app.use(express.json())
  }

  private routes() {
    this.app.use(testRouter)
  }

  public listen() {
    this.app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  }
}

const server = new Server()
export default server
