import app from "./app";
import { initDB } from "./config/db";

const port = 5000;

initDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
