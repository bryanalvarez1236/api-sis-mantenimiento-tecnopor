import { server } from '../../src/index'
import supertest from 'supertest'
import { Server } from '../../src/server'

const api = supertest(server.getApp())
const serverRoute = Server.route

export { api, serverRoute }
