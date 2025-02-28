interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
  }
  
  const fetchInterceptor = async (endpoint: string, options: FetchOptions = {}) => {
    const BASE_URL = import.meta.env.VITE_BASE_URL; // Base API URL
    const token = import.meta.env.VITE_API_TOKEN;  
    const accountId = import.meta.env.VITE_ACCOUNT_ID;  
    const workerName = import.meta.env.VITE_WORKER_NAME;  
  
    if (!BASE_URL) {
      console.error("Base URL is missing in environment variables");
      throw new Error("Base URL is not set");
    }
  
    if (!token || !accountId) {
      console.error("Missing authentication details");
      throw new Error("Missing authentication details");
    }
  
    // Construct full URL
    const url = `${BASE_URL}${endpoint}`;
  
    // Default headers
    const defaultHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-Account-Id": accountId,
      "X-Worker-Name": workerName
    };
  
    // Merge user-provided headers with default headers
    options.headers = { ...defaultHeaders, ...options.headers };
  
    try {
      const response = await fetch(url, options);
  
    
      return response;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };
  
  export default fetchInterceptor;
  