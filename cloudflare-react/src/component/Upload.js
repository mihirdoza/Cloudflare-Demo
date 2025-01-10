import React, { useState } from "react";
import axios from "axios";
import Loader from "../loader"; 
import { Navigate, useNavigate } from "react-router-dom";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [file, setFile] = useState(null);

 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid JSON file.");
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post(
        "https://red-king-482c.mohit-r.workers.dev",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(response?.data);
      console.log("File uploaded successfully:", response.data);
      navigate("/")
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error?.data || error?.message || "Error uploading file.");
    } finally {
      setLoading(false);
    }
  };
const navigate = useNavigate();

  return (
    <div className="container w-50 mt-5">
      {loading && <Loader />}
 
      <div className="p-4 shadow mt-4">
        <h3 className="mb-4">Cloudflare JSON File Upload</h3>
        <input
          type="file"
          accept=".json"
          className="form-control mb-3"
          onChange={handleFileChange}
        />
        <button className="me-2" onClick={() => navigate("/") }>
          Home
        </button>
        <button onClick={handleFileUpload}>
          Upload
        </button>
      </div>
    </div>
  );
};

export default App;
