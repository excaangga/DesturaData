import { useParams } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

const supabaseUrl = 'https://fjqkgesfphrdvtuvgxvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcWtnZXNmcGhyZHZ0dXZneHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTMyNDUxMzksImV4cCI6MjAwODgyMTEzOX0.OqCMygU_Y1ugMtXRrN7YPQuGSqOWJ9cT3AFAqFF-BEw';
const supabase = createClient(supabaseUrl, supabaseKey);

Modal.setAppElement('#root');

export default function AksesData() {
    const { idKelompok } = useParams();
    const [loading, setLoading] = useState(true);
    const [PERSON, setPERSON] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [kelompokChoice, setKelompokChoice] = useState([]);
    const [KELOMPOK, setKELOMPOK] = useState(null);
    const [statusChoice, setStatusChoice] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true); // Set loading to true while fetching
            const [personResult, kelompokResult] = await Promise.all([
                supabase
                    .from('PERSON')
                    .select('*, KELOMPOK(nama_kelompok), STATUS(nama_status)')
                    .eq('id_kelompok', idKelompok),
                supabase
                    .from('KELOMPOK')
                    .select('*')
                    .eq('id_kelompok', idKelompok)
            ]);

            if (personResult.error || kelompokResult.error) {
                // Handle error
                console.error('Error occurred while fetching data');
                return;
            }

            setPERSON(personResult.data);
            setKELOMPOK(kelompokResult.data);
        } finally {
            setLoading(false); // Set loading to false when fetching is done
        }
    };

    const fetchKelompok = async () => {
        const { data, error } = await supabase
            .from('KELOMPOK')
            .select('*');

        if (error) console.error('Error occurred while fetching kelompok');
        else setKelompokChoice(data);
    };

    const fetchStatus = async () => {
        const { data, error } = await supabase
            .from('STATUS')
            .select('*');

        if (error) console.error('Error occurred while fetching status');
        else setStatusChoice(data);
    };

    useEffect(() => {
        fetchData();
        fetchKelompok();
        fetchStatus();
    }, [idKelompok]);

    const handleAddRecord = () => {
        setFormData({});
        setModalOpen(true);
    };

    const handleEdit = (personId) => {
        const personData = PERSON.find(item => item.id_person === personId);
        setFormData(personData);
        setModalOpen(true);
    };

    const handleDelete = async (personId) => {
        if (window.confirm('Hapus data ini?')) {
            const { error } = await supabase.from('PERSON').delete().eq('id_person', personId);
            if (error) console.error('Error deleting data');
            else fetchData();
        }
    };

    const handleSave = async () => {
        if (formData.id_person) {
            const { error } = await supabase
                .from('PERSON')
                .update({
                    nama_person: formData.nama_person,
                    usia_person: formData.usia_person,
                    gender: formData.gender,
                    id_kelompok: idKelompok,
                    id_status: formData.id_status,
                })
                .eq('id_person', formData.id_person);

            if (error) console.error('Error updating data');
        } else {
            const { error } = await supabase
                .from('PERSON')
                .insert([
                    {
                        nama_person: formData.nama_person,
                        usia_person: formData.usia_person,
                        gender: formData.gender,
                        id_kelompok: idKelompok,
                        id_status: formData.id_status,
                    },
                ]);

            if (error) console.error('Error inserting data');
        }
        fetchData();
        setModalOpen(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="flex-grow">
            {loading ? (
                <div className="h-full flex justify-center items-center">Loading...</div>
            )
                :
                (
                    <div className="overflow-auto">
                        {KELOMPOK && (
                            <div className='px-5 py-5 text-2xl text-gray-500 border-b border-gray-500'>
                                {KELOMPOK[0].nama_kelompok}
                            </div>
                        )}
                        {PERSON && PERSON.map((item, index) => (
                            <div key={item.id_person} className='px-5 py-3 border-b border-gray-500'>
                                {item.nama_person}
                                <div className="mt-2 flex text-xs">
                                    {item.gender === 'L' ?
                                        <div className="px-2 py-1 border rounded-md">Laki-laki</div>
                                        :
                                        <div className="px-2 py-1 border rounded-md">Perempuan</div>
                                    }
                                    <div className="ml-3 px-2 py-1 border rounded-md">{item.STATUS.nama_status}</div>
                                    <div className="ml-3 px-2 py-1 border rounded-md">{item.usia_person}</div>
                                </div>
                                <div className="flex justify-center mt-4">
                                    <button className="mr-3 w-14 rounded-md py-1 bg-yellow-300 text-xs text-gray-800" onClick={() => handleEdit(item.id_person)}>Edit</button>
                                    <button className="w-14 rounded-md py-1 bg-red-300 text-xs text-gray-800" onClick={() => handleDelete(item.id_person)}>Delete</button>
                                </div>
                            </div>
                        ))}
                        {/* FAB */}
                        <div className="fixed md:absolute bottom-10 right-10 md:bottom-20 md:right-10">
                            <button
                                className="w-12 h-12 bg-green-300 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-100"
                                onClick={handleAddRecord}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="#1F2937"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setModalOpen(false)}
                className="modal mx-auto mt-10 max-w-md bg-gray-800 p-4 rounded-lg text-gray-100 w-[90%]"
                overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                    className="space-y-4"
                >
                    <input name="id_person" type="hidden" value={formData.id_person || ''} />
                    <label className="block">
                        <span className="">Nama:</span>
                        <input
                            name="nama_person"
                            value={formData.nama_person || ''}
                            onChange={handleChange}
                            required
                            className="form-input text-gray-800 mt-1 block w-full bg-gray-100 px-1 py-1 outline-none"
                            placeholder="Masukkan nama"
                        />
                    </label>
                    <label className="block">
                        <span className="">Usia:</span>
                        <input
                            name="usia_person"
                            type="number"
                            value={formData.usia_person || ''}
                            onChange={handleChange}
                            required
                            className="form-input text-gray-800 mt-1 block w-full bg-gray-100 px-1 py-1 outline-none"
                            placeholder="Masukkan usia"
                        />
                    </label>
                    <label className="block">
                        <span className="">Gender:</span>
                        <select
                            name="gender"
                            value={formData.gender || ''}
                            onChange={handleChange}
                            required
                            className="form-select text-gray-800 mt-1 block w-full bg-gray-100 px-1 py-1 outline-none"
                        >
                            <option value="">Pilih gender...</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="">Status:</span>
                        <select
                            name="id_status"
                            value={formData.id_status || ''}
                            onChange={handleChange}
                            required
                            className="form-select text-gray-800 mt-1 block w-full bg-gray-100 px-1 py-1 outline-none"
                        >
                            <option value="">Pilih status...</option>
                            {statusChoice.map((item) => (
                                <option key={item.id_status} value={item.id_status}>
                                    {item.nama_status}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex justify-center items-center">
                        <button
                            type="submit"
                            className="btn-primary mx-auto mt-4 px-4 py-2 text-gray-800 font-semibold rounded-lg bg-green-300 hover:bg-green-100"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
