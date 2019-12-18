const fs = require('fs')
const pump = require('pump')
const path = require('path');
const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : '35.203.41.189',
  user     : 'poweruser',
  password : 'tenpenny1',
  database : 'circlebeats'
});

module.exports = async function routes(fastify,options,next) {

  //ADD BEATS TO MP3 FOLDER
  fastify.post('/beats/mp3', async (request,reply) => {
    const mp = await request.multipart(handler, function(err) {
      if(err){
        reply.code(400).send({
          uploaded: false,
          fileType: 'mp3',
          error: err
        })
      } else {
        reply.code(200).send({
          uploaded: true,
          fileType: 'mp3',
          error: 'Uploaded without errors'
        })
      }
    })
    mp.on('field', function (key, value) {
      console.log('form-data', key, value)
    })
    function handler (field, file, filename, encoding, mimetype) {
      console.log(file,filename)
      pump(file, fs.createWriteStream(`./storage/mp3/${filename}`))
    }
  })

  // ADD BEATS TO WAV FOLDER
  fastify.post('/beats/wav', async (request,reply)=>{
    const mp = await request.multipart(handler, function(err) {
      if(err){
        reply.code(400).send({
          uploaded: false,
          fileType: 'WAV',
          error: err
        })
      } else {
        reply.code(200).send({
          uploaded: true,
          fileType: 'WAV',
          error: 'Uploaded without errors'
        })
      }
      reply.code(200)
    })
    mp.on('field', function (key, value) {
      console.log('form-data', key, value)
    })
    function handler (field, file, filename, encoding, mimetype) {
      pump(file, fs.createWriteStream(`./storage/wav/${filename}`))
    }
  })

  // ADD BEATS TO STEMS FOLDER
  fastify.post('/beats/stems', async (request,reply)=>{
    const mp = await request.multipart(handler, function(err) {
      if(err){
        reply.code(400).send({
          uploaded: false,
          fileType: 'zip',
          error: err
        })
      } else {
        reply.code(200).send({
          uploaded: true,
          fileType: 'zip',
          error: 'Uploaded without errors'
        })
      }
    })
    mp.on('field', function (key, value) {
      console.log('form-data', key, value)
    })
    function handler (field, file, filename, encoding, mimetype) {
      pump(file, fs.createWriteStream(`./storage/stems/${filename}`))
    }
  })

  // ADD BEAT IMAGE TO IMAGE FOLDER
  fastify.post('/beats/images', async (request,reply)=>{
    const mp = await request.multipart(handler, function(err) {
      if(err){
        reply.code(400).send({
          uploaded: false,
          fileType: 'Image',
          error: err
        })
      } else {
        reply.code(200).send({
          uploaded: true,
          fileType: 'Image',
          error: 'Uploaded without errors'
        })
      }
    })
    mp.on('field', function (key, value) {
      console.log('form-data', key, value)
    })
    function handler (field, file, filename, encoding, mimetype) {
      pump(file, fs.createWriteStream(`./storage/images/${filename}`))
    }
  })

  // AUDIO STREAMING PER REQUEST
  fastify.get('/beats/:name', async (request,reply)=>{
    const pathLink = path.join(__dirname,'..','storage','mp3',`${request.params.name}.mp3`)
    //const stream = fs.createReadStream(pathLink, 'base64')
    fs.readFile(pathLink, function(err,fileBuffer) {
      console.log(fileBuffer)
      reply.header('Content-Type','audio/mpeg')
        .send(fileBuffer)
        .code(200)
    })
  })

  // INSERT INTO DATABASE
  fastify.post('/beatsFull', async (request,reply)=>{
    let addUrl = `http://35.188.61.24:80/beats/mp3/${request.body.title}`
    connection.query( 'insert into trakz (title, producer, bpm, userTag1, userTag2, url, filterTag1, filterTag2,genre) values (?,?,?,?,?,?,?,?,?)',[request.body.title,request.body.producer,request.body.bpm,request.body.userTag1,request.body.userTag2,addUrl,request.body.filterTag1,request.body.filterTag2,request.body.genre], function (err,result) {
      if(err){
        reply.send(err).code(400)
      }else {
        reply.send({
          db:'Successfully added to DB',
          result:`${result}`
        })
      }
    })
  })

  // GET ALL BEATS
  fastify.get('/beatsFull', async (request,reply)=>{
    await connection.query('SELECT fid, title, producer, plays, bpm, userTag1, userTag2, filterTag1, filterTag2, url,genre FROM trakz', function (error, results, fields) {
      if (error) {
        console.log(error)
      }else {
        console.log(results)
        reply.send(results, fields)
        //connection.end();
      }
    });
  })
}
