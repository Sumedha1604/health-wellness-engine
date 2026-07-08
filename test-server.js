const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello!" }));
});

server.listen(5050, () => {
  console.log("Listening on http://localhost:5050");
});
