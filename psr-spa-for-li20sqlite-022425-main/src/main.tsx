import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css";
import {ToastContainer} from "react-toastify"

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <>
    <ToastContainer theme={'light'} position={'top-right'} autoClose={3000}></ToastContainer>
    <App /></>
  // </StrictMode>,
)
