import app from "./app";
import { initDB } from "./config/db";

const port = 5000;

initDB();

app.listen(port, () => {
  console.log(` Assignment 2 Server running on port ${port}`);
});
