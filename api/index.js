import DbConnect from "../Server/src/DB/index.js";
import app from "../Server/src/app.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await DbConnect();
    isConnected = true;
  }
  return app(req, res);
}
