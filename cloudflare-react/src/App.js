import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from "./component/Homepage";
import FileUpload from './component/Upload';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/upload" element={<FileUpload />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
