import supertest from 'supertest'
import server, { Server } from '../../src/server'

const api = supertest.agent(server.getApp())
const serverRoute = Server.route

export { api, serverRoute }
