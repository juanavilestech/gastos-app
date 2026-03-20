const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require(path.join(__dirname, "../src/config/db"));

const categories = [
  "Comida",
  "Transporte",
  "Vivienda",
  "Entretenimiento",
  "Salud",
  "Otros",
];
const descriptions = {
  Comida: [
    "Supermercado",
    "Cena restaurante",
    "Café",
    "Almuerzo oficina",
    "Delivery Sushi",
  ],
  Transporte: ["Gasolina", "Uber", "Bus", "Mantenimiento auto", "Peajes"],
  Vivienda: ["Alquiler", "Luz", "Agua", "Internet", "Limpieza"],
  Entretenimiento: ["Cine", "Netflix", "Libro", "Salida amigos", "Videojuego"],
  Salud: [
    "Farmacia",
    "Consulta dental",
    "Gimnasio",
    "Seguro médico",
    "Vitaminas",
  ],
  Otros: ["Regalo", "Ropa", "Corte de pelo", "Suscripción", "Imprevisto"],
};

async function seed() {
  console.log("🌱 Seeding 30 expenses for March 2026...");

  try {
    // Clear existing March expenses if any (optional, but let's just add them)
    // await pool.query("DELETE FROM expenses WHERE date >= '2026-03-01' AND date <= '2026-03-31'");

    for (let i = 1; i <= 30; i++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const descriptionList = descriptions[category];
      const description =
        descriptionList[Math.floor(Math.random() * descriptionList.length)];
      const amount = parseFloat((Math.random() * (100 - 5) + 5).toFixed(2));
      const day = Math.floor(Math.random() * 20) + 1; // 1 to 20th of March
      const date = `2026-03-${day.toString().padStart(2, "0")}`;

      await pool.query(
        "INSERT INTO expenses (amount, category, description, date) VALUES ($1, $2, $3, $4)",
        [amount, category, description, date],
      );
    }

    console.log("✅ Successfully seeded 30 expenses!");
  } catch (err) {
    console.error("❌ Error seeding data:", err.message);
  } finally {
    await pool.end();
  }
}

seed();
