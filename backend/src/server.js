const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("process.env.PORT =", process.env.PORT);

require("./config/db");

const app = require("./app");

const PORT = process.env.PORT || 5001;

console.log("Using PORT =", PORT);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});