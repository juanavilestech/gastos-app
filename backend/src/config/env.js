function getEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`❌ Missing environment variable: ${name}`);
  }

  return value;
}

const env = {
  PORT: process.env.PORT || 3000,

  DB_HOST: getEnv("DB_HOST"),
  DB_PORT: getEnv("DB_PORT"),
  DB_USER: getEnv("DB_USER"),
  DB_PASSWORD: getEnv("DB_PASSWORD"),
  DB_NAME: getEnv("DB_NAME")
};

module.exports = env;
