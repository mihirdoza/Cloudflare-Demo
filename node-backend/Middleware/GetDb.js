import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { CLOUDFLARE_API_KEY, ACCOUNT_ID, KV_NAMESPACE_ID } = process.env;

// 🔹 Cloudflare API Helper
const cloudflareApi = async (method, url, data = {}) => {
  try {
    const response = await axios({
      method,
      url: `https://api.cloudflare.com/client/v4${url}`,
      headers: { Authorization: `Bearer ${CLOUDFLARE_API_KEY}` },
      data,
    });
    console.log(`[Cloudflare API] ${method} ${url}`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `[Cloudflare API Error] ${method} ${url}`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// 🔹 Middleware to Get DB ID from KV Storage
export const getDbFromKv = async (req, res, next) => {
  try {
    const kvResponse = await cloudflareApi(
      "GET",
      `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/db_uuid`
    );
    console.log("response===>", kvResponse);
    if (!kvResponse) {
      res
        .status(500)
        .json({
          success: false,
          error: "No DataBase Found",
          errorDetails: "Database ID not found",
        });
      return;
    }

    req.db = await kvResponse; // Attach DB ID to request
    console.log("Database ID from KV:", req.db);
    next();
  } catch (error) {
    console.error("Error retrieving DB from KV:", error);
    console.error("Error retrieving DB from KV:", error.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Error retrieving database ID",
        errorDetails: error.message,
      });
  }
};
