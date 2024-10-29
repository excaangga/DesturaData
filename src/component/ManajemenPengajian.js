import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from './SupabaseClient';

Modal.setAppElement('#root');

export default function ManajemenPengajian() {
    const [pengajianData, setPengajianData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [heldAt, setHeldAt] = useState(new Date());

    // Fetch all pengajian records
    function fetchPengajianData() {
        setLoading(true);
        supabase
            .from('PENGAJIAN')
            .select('*')
            .order('held_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error fetching data:', error);
                } else {
                    setPengajianData(data);
                }
                setLoading(false);
            });
    }

    // Function to add new pengajian
    function handleAddPengajian() {
        supabase
            .from('PENGAJIAN')
            .insert([{ held_at: heldAt.toISOString() }])
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error adding pengajian:', error);
                } else {
                    fetchPengajianData();  // Refresh the data after adding
                    setModalOpen(false);   // Close modal after successful insert
                    setHeldAt(new Date());         // Reset input field
                }
            });
    }

    function toggleModal() {
        setModalOpen((prev) => !prev);
    }

    useEffect(() => {
        fetchPengajianData();
    }, []);

    return (
        <div className="flex-grow overflow-auto">
            <div className="p-5">
                <h1 className="px-5 py-5 text-2xl text-gray-100 border-b border-gray-500">Manajemen Pengajian</h1>

                {/* Floating Add Pengajian Button */}
                <div className="fixed md:absolute bottom-10 right-10 md:bottom-20 md:right-10">
                    <button
                        className="w-12 h-12 bg-green-300 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-100"
                        onClick={toggleModal}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#1F2937">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Loading Indicator */}
                {loading ? (
                    <div className="h-full flex justify-center items-center text-lg text-gray-600">Loading...</div>
                ) : (
                    <div className="overflow-auto">
                        <table className="min-w-full bg-gray-800">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 text-left text-gray-300 text-xl font-medium">No.</th>
                                    <th className="py-2 px-4 text-left text-gray-300 text-xl font-medium">Tanggal Pengajian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pengajianData.map((pengajian, index) => (
                                    <tr key={pengajian.id} className="border-b border-gray-700">
                                        <td className="py-2 px-4 text-gray-200 text-lg">
                                            {index + 1}
                                        </td>
                                        <td className="py-2 px-4 text-gray-200 text-lg">
                                            {new Date(pengajian.held_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Adding Pengajian */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={toggleModal}
                className="modal mx-auto mt-10 max-w-md bg-gray-800 p-6 rounded-lg text-gray-100 w-[90%]"
                overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50"
            >
                <h2 className="text-2xl font-bold mb-4">Tambah Pengajian</h2>
                <label className="block mb-2 text-gray-300 text-lg">
                    Tanggal Pengajian:
                    <DatePicker
                        selected={heldAt}
                        onChange={(date) => setHeldAt(date)}
                        className="mt-1 px-3 py-2 w-full bg-gray-900 border border-gray-700 rounded-md text-gray-200"
                    />
                </label>
                <div className="mt-6 flex justify-end">
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-400"
                        onClick={handleAddPengajian}
                    >
                        Simpan
                    </button>
                </div>
            </Modal>
        </div>
    );
}

