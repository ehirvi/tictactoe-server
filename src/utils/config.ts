import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("ENV: SECRET not defined");
}

export default { JWT_SECRET };
