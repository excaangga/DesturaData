import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AksesData from './component/AksesData';
import Home from './component/Home';

export default function App() {
  return (
    <Router>
      <div className="container max-w-[480px] h-screen mx-auto font-poppins text-gray-100 bg-gray-800 flex flex-col">
        {/* HEADER */}
        <div className="h-[10%] bg-gray-800 flex items-center border-b border-gray-500">
          <Link to={'/'}>
            <div className="ml-10 text-2xl">Destura<span className='text-green-300'>Data</span></div>
          </Link>
        </div>
        {/* BODY */}
        <Routes>
          <Route exact path='/' element={< Home />}>
          </Route>
          <Route exact path="/akses-data/:idKelompok" element={< AksesData />}>
          </Route>
        </Routes>
        {/* FOOTER */}
        <div className='px-auto py-3 text-center text-xs bg-gray-800 text-gray-100'>
          Powered by Destura 2023 | v0.1
        </div>
      </div>
    </Router>
  );
}
