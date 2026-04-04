import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase } from "./database/connection.js";

const app = createApp();
const PORT = Number(process.env.PORT) || 3000;

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
