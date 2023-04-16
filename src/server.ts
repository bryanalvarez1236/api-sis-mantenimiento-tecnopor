import express, { Application } from 'express'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import { PORT } from './config/environment'
import testRouter from './routes/test.routes'
import machineRouter, { machineRoute } from './routes/machine.routes'
import activityRouter, { activityRoute } from './routes/activity.route'
import workOrderRouter, { workOrderRoute } from './routes/workOrder.routes'
import draftWorkOrderRouter, {
  draftWorkOrderRoute,
} from './routes/draftWorkOrder.route'

export class Server {
  private app: Application
  static route = '/api'

  constructor() {
    this.app = express()

    this.middlewares()
    this.routes()
  }

  private middlewares() {
    this.app.use(cors())
    this.app.use(express.json())
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: './uploads',
      })
    )
  }

  private routes() {
    this.app.use(testRouter)
    this.app.use(this.createRoute(machineRoute), machineRouter)
    this.app.use(this.createRoute(activityRoute), activityRouter)
    this.app.use(this.createRoute(draftWorkOrderRoute), draftWorkOrderRouter)
    this.app.use(this.createRoute(workOrderRoute), workOrderRouter)
  }

  private createRoute(route: string) {
    return `${Server.route}${route}`
  }

  public listen() {
    return this.app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  }

  public getApp() {
    return this.app
  }
}

const server = new Server()
export default server
