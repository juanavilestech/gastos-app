const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin123",
  database: "gastos_db",
});

const expensesCategories = [
  "Comida",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Hogar",
  "Ropa",
  "Otros",
];

const incomeCategories = ["Sueldo", "Venta", "Inversión", "Regalo", "Otros"];

const expenseDescriptions = [
  "Supermercado",
  "Cena en restaurante",
  "Uber al trabajo",
  "Gasolina",
  "Netflix",
  "Cine",
  "Farmacia",
  "Gimnasio",
  "Libros",
  "Alquiler",
  "Luz y Agua",
  "Zapatos",
  "Camiseta",
  "Café",
  "Suscripción Software",
  "Seguro médico",
];

const incomeDescriptions = [
  "Salario mensual",
  "Proyecto Freelance",
  "Venta de gadget",
  "Bono trimestral",
  "Dividendos",
];

async function seed() {
  console.log("🌱 Iniciando carga de 100 registros simulados...");

  try {
    for (let i = 0; i < 100; i++) {
      const isIncome = Math.random() < 0.2; // 20% ingresos, 80% gastos
      const type = isIncome ? "ingreso" : "gasto";
      const categories = isIncome ? incomeCategories : expensesCategories;
      const descriptions = isIncome ? incomeDescriptions : expenseDescriptions;

      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const description =
        descriptions[Math.floor(Math.random() * descriptions.length)];
      const amount = isIncome
        ? (Math.random() * 5000 + 1000).toFixed(2)
        : (Math.random() * 500 + 10).toFixed(2);

      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Últimos 60 días

      await pool.query(
        "INSERT INTO expenses (amount, category, description, date, type) VALUES ($1, $2, $3, $4, $5)",
        [amount, category, description, date.toISOString().split("T")[0], type],
      );
    }

    console.log("✅ Carga completada exitosamente.");
  } catch (err) {
    console.error("❌ Error durante el seeding:", err);
  } finally {
    await pool.end();
  }
}

seed();
