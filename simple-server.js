const http = require("http");

const server = http.createServer((req, res) => {
  console.log("Request:", req.method, req.url);

  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify({ ok: true }));
});

server.listen(5050, () => {
  console.log("Listening on http://localhost:5050");
});
