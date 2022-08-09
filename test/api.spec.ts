import { app } from '../src/index'
import { api } from './helpers'

describe('GET /ping', () => {
  it('should return 200 OK', () => {
    return api.get('/ping').expect(200)
  })
  afterAll(() => {
    app.close()
  })
})
