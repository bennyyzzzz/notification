import app from "./app.js";

import { startScheduler } from "./jobs/scheduler.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
  startScheduler();
});