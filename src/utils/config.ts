import dotenv from "dotenv"
dotenv.config()

const SECRET = process.env.SECRET;

if (!SECRET) {
  throw new Error("ENV: SECRET not defined");
}

export default { SECRET };
