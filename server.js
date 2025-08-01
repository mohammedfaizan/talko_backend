import dotenv from "dotenv";
import connectDB from "./db/index.js";

import { server } from "./libs/socket.js";

// Load environment variables
dotenv.config({ path: ".env" });

// Port setup
const PORT = process.env.PORT || 7001;

// Start server after DB connection
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
