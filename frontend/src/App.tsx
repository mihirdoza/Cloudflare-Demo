import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './Components/Home/Home';
import Upload from './Components/UploadDB/Upload';



function App() {




  return (
    <div className="nz-app-container">
      <BrowserRouter>
      <Routes>
        <Route path='/search' element={<Home></Home>}></Route>
        <Route path='/' element={<Upload></Upload>}></Route>


      </Routes>
      
      </BrowserRouter>

      {/* <TestContainer /> */}
  
    
    </div>
  );
}

export default App;
