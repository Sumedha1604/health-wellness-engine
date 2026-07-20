const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

require("./config/db");

const app = require("./app");

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});