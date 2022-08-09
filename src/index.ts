import 'dotenv/config'

import server from './server'

const app = server.listen()

export { app, server }
