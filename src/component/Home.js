import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const supabaseUrl = 'https://fjqkgesfphrdvtuvgxvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcWtnZXNmcGhyZHZ0dXZneHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTMyNDUxMzksImV4cCI6MjAwODgyMTEzOX0.OqCMygU_Y1ugMtXRrN7YPQuGSqOWJ9cT3AFAqFF-BEw';
const supabase = createClient(supabaseUrl, supabaseKey);
export default function Home() {
    const [dataKelompokVisible, setDataKelompokVisible] = useState(false);
    const [KELOMPOK, setKELOMPOK] = useState(null);
    const toggleKelompokDropdown = () => {
        setDataKelompokVisible(!dataKelompokVisible);
    };

    useEffect(() => {
        const fetchData = async () => {
            let { data, error } = await supabase
                .from('KELOMPOK')
                .select('*');
            setKELOMPOK(data);
        };
        fetchData();
    }, []);
    return (
        <div className="flex-grow overflow-auto">
            <div className='px-10 py-5 border-b border-gray-500'>
                <div className='text-gray-500'>
                    Data Remaja
                </div>
                <div className='pt-3 text-gray-100'>
                    <div className='pb-2 px-auto cursor-pointer select-none' onClick={toggleKelompokDropdown}>Akses Data</div>
                    {dataKelompokVisible && KELOMPOK && (
                        <div className=''>
                            {KELOMPOK.map((item, index) => (
                                <Link to={`/akses-data/${item.id_kelompok}`} key={index} className='cursor-pointer'>
                                    <div className='py-2 pl-5 hover:bg-gray-500' key={index}>{item.nama_kelompok}</div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <div className='pt-3 text-gray-100'>
                    Summary Kelompok [soon]
                </div>
            </div>
            <div className='px-10 py-5 border-b border-gray-500'>
                <div className='text-gray-500'>
                    Pelaporan
                </div>
                <div className='pt-3 text-gray-100'>
                    Pelaporan Turba [soon]
                </div>
                <div className='pt-3 text-gray-100'>
                    Pelaporan KU [soon]
                </div>
                <div className='pt-3 text-gray-100'>
                    Pelaporan Lainnya [soon]
                </div>
            </div>
            <div className='px-10 py-5 border-b border-gray-500'>
                <div className='text-gray-500'>
                    Presensi
                </div>
                <div className='pt-3 text-gray-100'>
                    Pengajian Remaja Desa [soon]
                </div>
            </div>
        </div>
    );
};