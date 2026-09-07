import { createApp } from "./src/app.js";
import { env } from "./src/config/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});
