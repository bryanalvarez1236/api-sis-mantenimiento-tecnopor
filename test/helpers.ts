import { server } from '../src/index'
import supertest from 'supertest'

const api = supertest(server.getApp())

export { api }
