import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './SupabaseClient';

export default function Home() {
    const [dataKelompokVisible, setDataKelompokVisible] = useState(false);
    const [dataPresensiVisible, setDataPresensiVisible] = useState(false);
    const [KELOMPOK, setKELOMPOK] = useState(null);
    const [loading, setLoading] = useState(true);

    function toggleKelompokDropdown() {
        setDataKelompokVisible(!dataKelompokVisible);
    }
    function togglePresensiDropdown() {
        setDataPresensiVisible(!dataPresensiVisible);
    }

    useEffect(() => {
        function fetchData() {
            setLoading(true);
            supabase
                .from('KELOMPOK')
                .select('*')
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error fetching data:', error);
                    } else {
                        setKELOMPOK(data);
                    }
                })
                .finally(() => setLoading(false));
        }
        fetchData();
    }, []);

    return (
        <div className="flexoverflow-auto">
            <div className="px-10 py-5 border-b border-gray-500">
                <div className="text-gray-500">Data Remaja</div>
                <div className="pt-3 text-gray-100">
                    <div
                        className="pb-2 cursor-pointer select-none"
                        onClick={toggleKelompokDropdown}
                    >
                        Akses Data
                    </div>
                    {dataKelompokVisible && (
                        loading ? (
                            <div className="py-2 pl-5">Loading...</div>
                        ) : (
                            KELOMPOK && (
                                <div>
                                    {KELOMPOK.map((item) => (
                                        <Link
                                            to={`/akses-data/${item.id_kelompok}`}
                                            key={item.id_kelompok}
                                            className="cursor-pointer"
                                        >
                                            <div className="py-2 pl-5 hover:bg-gray-500">
                                                {item.nama_kelompok}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )
                        )
                    )}
                </div>
                <div className="pt-3 text-gray-100">Summary Kelompok</div>
            </div>

            <div className="px-10 py-5 border-b border-gray-500">
                <div className="text-gray-500">Pelaporan</div>
                <div className="pt-3 text-gray-100">Pelaporan Turba</div>
                <div className="pt-3 text-gray-100">Pelaporan KU</div>
                <div className="pt-3 text-gray-100">Pelaporan Lainnya</div>
            </div>

            <div className="px-10 py-5 border-b border-gray-500">
                <div className="text-gray-500">Presensi</div>
                <div className="pt-3 text-gray-100">
                    <Link
                        to={`/pengajian`}
                        className="cursor-pointer"
                    >
                        Manajemen Pengajian
                    </Link>
                </div>
                <div className="pt-3 text-gray-100">
                    <div
                        className="pb-2 cursor-pointer select-none"
                        onClick={togglePresensiDropdown}
                    >
                       Pengajian Remaja Desa 
                    </div>
                    {dataPresensiVisible && (
                        loading ? (
                            <div className="py-2 pl-5">Loading...</div>
                        ) : (
                            KELOMPOK && (
                                <div>
                                    {KELOMPOK.map((item) => (
                                        <Link
                                            to={`/presensi/${item.id_kelompok}`}
                                            key={item.id_kelompok}
                                            className="cursor-pointer"
                                        >
                                            <div className="py-2 pl-5 hover:bg-gray-500">
                                                {item.nama_kelompok}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
