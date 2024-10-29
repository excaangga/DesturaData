import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AksesData from './component/AksesData';
import Home from './component/Home';
import ManajemenPengajian from './component/ManajemenPengajian';
import PresensiPengajian from './component/PresensiPengajian';

export default function App() {
  return (
    <Router>
      <div className="container relative md:max-w-[640px] min-h-screen mx-auto font-poppins text-gray-100 bg-gray-800 flex flex-col">
        {/* HEADER */}
        <div className="h-[10%] bg-gray-800 flex items-center border-b border-gray-500 top-0">
          <Link to={'/'} className='select-none'>
            <div className="ml-4 text-2xl">Destura<span className='text-green-300'>Data</span></div>
          </Link>
        </div>
        {/* BODY */}
        <Routes>
          <Route exact path='/' element={< Home />}>
          </Route>
          <Route exact path="/akses-data/:idKelompok" element={< AksesData />}>
          </Route>
          <Route exact path="/presensi/:idKelompok" element={< PresensiPengajian />}>
          </Route>
          <Route exact path="/pengajian" element={< ManajemenPengajian />}>
          </Route>
        </Routes>
        {/* FOOTER */}
        <div className='px-auto py-3 text-center text-xs bg-gray-800 text-gray-100'>
          Powered by Destura 2024 | v0.2.1
        </div>
      </div>
    </Router>
  );
}
