const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const express = require("express");
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(cors());

// Read the worker script from a file
const workerScriptPath = "./worker.js";
const workerScript = fs.readFileSync(workerScriptPath, "utf8");

//  authentication middlwere check token
async function validateToken(req, res, next) {
  try {
    const authToken = req.headers["authorization"];
    const accountId = req.headers["x-account-id"];

    if (!authToken || !accountId) {
      return res
        .status(400)
        .json({ message: "Missing Token or Account ID" });
    }

    console.log("🔍 Validating Token:", { authToken, accountId });

    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}`,
      {
        headers: { Authorization: authToken },
      }
    );

    if (!response.data.success) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    console.log("✅ Token is valid:", response.data);
    next(); // Call next properly to continue request processing
  } catch (err) {
    console.error("❌ Token Validation Error:", err.message);
    res.status(401).json({ message: "Invalid Token" });
  }
}

//  check cloudflare worker exist
app.post("/api/cloudflare/worker/check", validateToken, async (req, res) => {
  const name = await req.body.name;
  const authToken = req.headers["authorization"]; // ✅ Correct
  const accountId = req.headers["x-account-id"]; // ✅ Correct
  // Metadata (Cloudflare expects "main_module" key)
  const metadata = { main_module: "worker.js" };

  // Create FormData for multipart request
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(metadata), {
    filename: "metadata.json",
    contentType: "application/json",
  });
  formData.append("main_module", workerScript, {
    filename: "worker.js",
    contentType: "application/javascript+module",
  });

  console.log(req.body);
  try {
    if (!name) {
      res.status(400).json({ message: "Worker Name is Missing" });
    }

    // **Step 1: Check if Worker Already Exists**
    const checkWorkerResponse = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts`,
      { headers: { Authorization: authToken } }
    );

    const existingWorkers = checkWorkerResponse.data.result;
    const workerExists = existingWorkers.some((worker) => worker.id === name);

    if (workerExists) {
      return res
        .status(200)
        .json({ message: "Worker already exists", isExist: true });
    } else {
      // **Step 2: Create if Worker Not Exists**
      axios
        .put(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${name}`,
          formData,
          {
            headers: {
              Authorization: authToken,
              ...formData.getHeaders(),
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          res
            .status(200)
            .json({ message: "Worker Created SuccessFully", isExist: false });
        })
        .catch((error) => {
          console.error(
            "Error:",
            error.response ? error.response.data : error.message
          );
          res
            .status(500)
            .json({ message: "Server error", error: error.response });
        });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
});

//  cloudflare worker subdomain url get
app.post("/api/cloudflare/worker/url", validateToken, async (req, res) => {
  const authToken = req.headers["authorization"]; // ✅ Correct
  const accountId = req.headers["x-account-id"]; // ✅ Correct

  try {
    axios
      .get(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,

        {
          headers: {
            Authorization: authToken,
          },
        }
      )
      .then(async (response) => {
        console.log(response.data);

        res
          .status(200)
          .json({ message: "get Worker Url", res: response.data, ok: true });
      })
      .catch((error) => {
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
        res
          .status(500)
          .json({ message: "Server error", error: error, ok: false });
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", err, ok: false });
  }
});

//  check cloudflare Account
app.get("/api/cloudflare/account",validateToken, async (req, res) => {
  const authToken = req.headers["authorization"]; // ✅ Correct

  console.log(req.body);
  try {
    axios
      .get(
        `https://api.cloudflare.com/client/v4/accounts`,

        {
          headers: {
            Authorization: authToken,
          },
        }
      )
      .then(async (response) => {
        console.log(response.data);
        if (response?.data?.success) {
          res
            .status(200)
            .json({
              message: "Get Cloudflare Account",
              res: response.data,
              ok: true,
            });
        } else {
          res
            .status(400)
            .json({ message: "Invalid Token", res: response.data, ok: true });
        }
      })
      .catch((error) => {
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
        res
          .status(500)
          .json({ message: "Server error", error: error, ok: false });
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", err, ok: false });
  }
});

app.listen("5505", (res) => {
  try {
    console.log("server listen on 5505");
  } catch (err) {
    console.log(err);
  }
});
