import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

console.log("📋 Configuration de la base de données:");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: "postgres",
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à PostgreSQL réussie!");

    await sequelize.sync({ alter: true });
    console.log("✅ Tables synchronisées avec succès!");
  } catch (error) {
    console.error(
      "❌ Erreur de connexion à la base de données:",
      error.message
    );
    console.error("Détails:", error);
    process.exit(1);
  }
};

export default sequelize;
export { sequelize, testConnection };
