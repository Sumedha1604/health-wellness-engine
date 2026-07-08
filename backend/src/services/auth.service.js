const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function registerUser(userData) {
  const { first_name, last_name, email, password, gender } = userData;

  const [existing] = await db.execute(
    "SELECT user_id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await db.execute(
    `INSERT INTO users
      (first_name, last_name, email, password_hash, gender)
     VALUES (?, ?, ?, ?, ?)`,
    [first_name, last_name, email, passwordHash, gender]
  );

  return {
    user_id: result.insertId,
    first_name,
    last_name,
    email,
    gender,
  };
}

async function loginUser(email, password) {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = rows[0];

  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      gender: user.gender,
    },
  };
}

module.exports = {
  registerUser,
  loginUser,
};
