const http = require("http")
const living = require("./living/living.js")

const server = http.createServer()

server.on('request', (req, res) => {
    const url = req.url
    const method = req.method
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    let str = `url: ${url}  |  method: ${method}`
    res.end(str)
})

server.listen(8240, () => {
    console.log('Floating Living Server is on :)')
})

livingServer = new living()