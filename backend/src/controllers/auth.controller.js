const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL || "juanavilestech@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  // Simple validation for demonstration purposes
  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign(
      { email: adminEmail, name: "Admin" },
      process.env.JWT_SECRET,
      { expiresIn: "10d" },
    );

    return res.json({
      token,
      user: { email: "juanavilestech@gmail.com", name: "Juan Aviles" },
    });
  }

  return res.status(401).json({ error: "Invalid credentials" });
};

module.exports = { login };
