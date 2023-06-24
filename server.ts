import express, { Express } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

// Init Middleware
app.use(express.json());

// Define Routes
app.use("/api/invest", require("./routes/investRoutes"));
app.use("/api/token-amount", require("./routes/tokenAmountRoutes"));
app.use("/api/distribute", require("./routes/distributeRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
