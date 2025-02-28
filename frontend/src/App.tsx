import { useEffect, useState } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import "./psrStyles/index.css";
import SQLiteOneProjectUIPage from "./pages/upload/SQLiteOneProjectUI";
import SearchDatabase from "./pages/search/SearchUi";
import axios from "axios";
import { toast } from "react-toastify";


const isCreated = sessionStorage.getItem("worker_checked");

const Header = {
  Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
  "X-Account-Id": import.meta.env.VITE_ACCOUNT_ID,
  "X-Worker-Name": import.meta.env.VITE_WORKER_NAME,
};
const CloudflareAccountURL = "http://localhost:5505/api/cloudflare/Account"
const CloudflareWorkerURLGet = "http://localhost:5505/api/cloudflare/worker/url"
const CloudflareWorker = "http://localhost:5505/api/cloudflare/worker/check"


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<SQLiteOneProjectUIPage />} />
      <Route path="/search" element={<SearchDatabase />} />
    </Route>
  )
);



function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [checkStatus, setCheckStatus] = useState<number>(0);
  const [isCheckingComplete, setIsCheckingComplete] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading...")


  // Cloudflare Account Check
  const CloudflareAccountCheck = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Cloudflare Account Checking...")
      const response = await axios.get(CloudflareAccountURL, { headers: { ...Header } });
      if (response?.status === 200) {
        setCheckStatus(1);
        setLoadingMessage("Cloudflare Account is Valid ")
      }
    } catch (err: any) {
      console.error("Check Account", err);
      toast.error(err.response.data.message || err.message || "Error Validate Account");
    } finally {
      setLoading(false);
    }
  };

  // Get Cloudflare Worker Subdomain
  const CloudflareWorkerUrlGet = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Getting Cloudflare Worker Url...")
      const response = await axios.post(CloudflareWorkerURLGet, {}, { headers: { ...Header } });
      if (response.status === 200) {
        const res = response?.data?.res?.result?.subdomain;
        const workerName = import.meta.env.VITE_WORKER_NAME;
        const workerUrl = `https://${workerName}.${res}.workers.dev/`;

        localStorage.setItem("worker_url", workerUrl);
        setLoadingMessage("Got Cloudflare Worker Url")
        setCheckStatus(2);
      }
    } catch (err: any) {
      console.error("Get Worker url", err);
      toast.error(err.response.data.message || err.message || "Error getting URL");
    } finally {
      setLoading(false);
    }
  };

  // Check Cloudflare Worker
  const CloudflareWorkerCheck = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Cloudflare Worker Checking...")
      const response = await axios.post(CloudflareWorker, { name: import.meta.env.VITE_WORKER_NAME }, { headers: { ...Header } });
      if (response.status === 200) {
        console.log(response)

        setLoadingMessage("Cloudflare worker Checked Successfully")
        setCheckStatus(3);
        sessionStorage.setItem("worker_checked", "true");

      }


    } catch (err: any) {
      console.error("Worker Check", err);
      toast.error(err.response.data.message || err.message || "Error Checking Worker");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (checkStatus === 1) {
      CloudflareWorkerUrlGet();
    } else if (checkStatus === 2) {
      CloudflareWorkerCheck();
    } else if (checkStatus === 3) {
      toast.success("Cloudflare Initial Process Complete");
      setIsCheckingComplete(true);
    }
  }, [checkStatus]);

  useEffect(() => {
    if (!isCreated) {
      CloudflareAccountCheck();
    }
    else {
      setIsCheckingComplete(true);
    }
  }, []);

  return isCheckingComplete ? (
    <RouterProvider router={router} />
  ) : (
    <div className='pop-up  '>
      {loading && <div className="d-flex d-flex-column align-items-center justify-content-center gap-1">
        <div className='loading-boader'></div>
        <p className="">{loadingMessage}</p>
      </div>}
    </div>
  );
}

export default App;
