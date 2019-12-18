const fastify = require('fastify')({ logger:true })
const AutoLoad = require('fastify-autoload')
const fileUpload = require('fastify-file-upload')
const path = require('path');


fastify.register(require('fastify-cors'), {
  // put your options here
  origin:  true,
  methods: ['GET,PUT,POST']
})


fastify.register(require('fastify-redis'), {
  //TODO: Check redis IP
  host: '35.203.43.49',
  password: 'MPcv8UZrXdMG'
})


fastify.register(require('fastify-multipart'))

fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'services')
})

fastify.get('/', async (request, reply) => {
  return { path: 'root' }
})

const start = async () => {
  try {
    await fastify.listen(8080, '127.0.0.1')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
