import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET =
  process.env.NODE_ENV === "production" ? process.env.JWT_SECRET : "test";

if (!JWT_SECRET) {
  throw new Error("ENV: JWT_SECRET not defined");
}

export default { JWT_SECRET };
