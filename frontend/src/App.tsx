import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './Components/Home/Home';
import Upload from './Components/UploadDB/Upload';
// import UploadNew from './Components/UploadNew/Upload';



function App() {




  return (
    <div className="nz-app-container">
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home></Home>}></Route>
        <Route path='/upload' element={<Upload></Upload>}></Route>
        {/* <Route path='/upload' element={<UploadNew></UploadNew>}></Route> */}


      </Routes>
      
      </BrowserRouter>

      {/* <TestContainer /> */}
  
    
    </div>
  );
}

export default App;
