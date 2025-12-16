import app from "./app.ts";
import prismaClient from "./config/db.ts";

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
