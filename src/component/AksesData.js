import { useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { supabase } from "./SupabaseClient";

Modal.setAppElement('#root');

export default function AksesData() {
    const { idKelompok } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        person: null,
        kelompok: null,
        statusChoice: [],
        kelompokChoice: [],
    });
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    async function fetchData() {
        setLoading(true);
        try {
            const query = supabase
                .from('PERSON')
                .select('*, KELOMPOK(nama_kelompok), STATUS(nama_status)')
                .eq('id_kelompok', idKelompok);
            
            if (selectedStatus) {
                query.eq('id_status', selectedStatus);
            }
            if (searchTerm) {
                query.ilike('nama_person', `%${searchTerm}%`);
            }
            if (genderFilter) {
                query.eq('gender', genderFilter);
            }
            
            const [personResult, kelompokResult] = await Promise.all([
                query,
                supabase.from('KELOMPOK').select('*').eq('id_kelompok', idKelompok),
            ]);

            if (!personResult.error && !kelompokResult.error) {
                setData(prevData => ({
                    ...prevData,
                    person: personResult.data,
                    kelompok: kelompokResult.data,
                }));
            } else {
                console.error('Error fetching data');
            }
        } finally {
            setLoading(false);
        }
    }

    async function fetchOptions() {
        try {
            const [{ data: statusData, error: statusError }, { data: kelompokData, error: kelompokError }] = await Promise.all([
                supabase.from('STATUS').select('*'),
                supabase.from('KELOMPOK').select('*')
            ]);

            if (!statusError && !kelompokError) {
                setData(prevData => ({
                    ...prevData,
                    statusChoice: statusData,
                    kelompokChoice: kelompokData,
                }));
            } else {
                console.error('Error fetching options');
            }
        } catch (error) {
            console.error('Error in fetchOptions', error);
        }
    }

    function handleAddRecord() {
        setFormData({});
        setModalOpen(true);
    }

    function handleEdit(personId) {
        const personData = data.person.find(item => item.id_person === personId);
        setFormData(personData || {});
        setModalOpen(true);
    }

    async function handleDelete(personId) {
        if (window.confirm('Hapus data ini?')) {
            const { error } = await supabase.from('PERSON').delete().eq('id_person', personId);
            if (!error) fetchData();
            else console.error('Error deleting data');
        }
    }

    async function handleSave() {
        const { id_person, nama_person, usia_person, gender, id_status } = formData;

        const { error } = id_person
            ? await supabase.from('PERSON').update({ nama_person, usia_person, gender, id_kelompok: idKelompok, id_status }).eq('id_person', id_person)
            : await supabase.from('PERSON').insert({ nama_person, usia_person, gender, id_kelompok: idKelompok, id_status });

        if (!error) {
            fetchData();
            setModalOpen(false);
        } else {
            console.error('Error saving data');
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prevForm => ({ ...prevForm, [name]: value }));
    }

    function handleStatusChange(e) {
        setSelectedStatus(e.target.value);
    }

    function handleSearchChange(e) {
        setSearchTerm(e.target.value);
    }

    function handleGenderChange(e) {
        setGenderFilter(e.target.value);
    }

    useEffect(() => {
        fetchData();
        fetchOptions();
    }, [idKelompok, selectedStatus, searchTerm, genderFilter]);

    return (
        <div className="flex flex-col gap-4">
            <div className="sticky top-0 bg-gray-800">
                {data.kelompok && (
                    <div className='px-5 py-5 text-2xl text-gray-100 border-b border-gray-500'>
                        {data.kelompok[0].nama_kelompok}
                    </div>
                )}

                <div className="px-5 py-3 md:block hidden flex gap-4 border-b border-gray-500">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Cari nama..."
                        className="text-gray-100 px-2 py-2 bg-gray-900 border border-gray-800 rounded-md"
                    />
                    <select
                        value={genderFilter}
                        onChange={handleGenderChange}
                        className="text-gray-100 px-2 py-2 bg-gray-900 border border-gray-800 rounded-md"
                    >
                        <option value="">Pilih Gender</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                    <select
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        className="text-gray-100 px-2 py-2 bg-gray-900 border border-gray-800 rounded-md"
                    >
                        <option value="">Pilih Status</option>
                        {data.statusChoice.map((status) => (
                            <option key={status.id_status} value={status.id_status}>
                                {status.nama_status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {loading ? (
                <div className="h-full flex justify-center items-center">Loading...</div>
            ) : (
                <div className="h-full overflow-auto bg-gray-800">
                    

                    {data.person && data.person.map((item) => (
                        <div key={item.id_person} className='px-5 py-3 border-b border-gray-500'>
                            {item.nama_person}
                            <div className="mt-2 flex text-xs">
                                <div className="px-2 py-1 border rounded-md">{item.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                <div className="ml-3 px-2 py-1 border rounded-md">{item.STATUS.nama_status}</div>
                                <div className="ml-3 px-2 py-1 border rounded-md">{item.usia_person}</div>
                            </div>
                            <div className="flex justify-center mt-4">
                                <button 
                                    className="mr-3 w-14 rounded-md py-1 bg-yellow-300 text-xs text-gray-800" 
                                    onClick={() => handleEdit(item.id_person)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="w-14 rounded-md py-1 bg-red-300 text-xs text-gray-800" 
                                    onClick={() => handleDelete(item.id_person)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="fixed md:absolute bottom-10 right-10 md:bottom-20 md:right-10">
                        <button
                            className="w-12 h-12 bg-green-300 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-100"
                            onClick={handleAddRecord}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#1F2937">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <input 
                        name="id_person" 
                        type="hidden"
                        value={formData.id_person || ''} 
                        className="border rounded-md"
                    />
                    <label className="block">
                        <span>Nama:</span>
                        <input 
                            name="nama_person" 
                            value={formData.nama_person || ''} 
                            onChange={handleChange} 
                            required 
                            className="form-input text-gray-100 mt-1 block w-full bg-gray-900 px-2 py-2 outline-none border border-gray-800 rounded-md" 
                            placeholder="Masukkan nama" 
                        />
                    </label>
                    <label className="block">
                        <span>Usia:</span>
                        <input 
                            name="usia_person" 
                            type="number" 
                            value={formData.usia_person || ''} 
                            onChange={handleChange} 
                            required 
                            className="form-input text-gray-100 mt-1 block w-full bg-gray-900 px-2 py-2 outline-none border border-gray-800 rounded-md" 
                            placeholder="Masukkan usia" 
                        />
                    </label>
                    <label className="block">
                        <span>Gender:</span>
                        <select 
                            name="gender" 
                            value={formData.gender || ''}
                            onChange={handleChange} 
                            required 
                            className="form-select text-gray-100 mt-1 block w-full bg-gray-900 px-2 py-2 outline-none border border-gray-800 rounded-md"
                        >
                            <option value="">Pilih gender...</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </label>
                    <label className="block">
                        <span>Status:</span>
                        <select 
                            name="id_status" 
                            value={formData.id_status || ''} 
                            onChange={handleChange} 
                            required 
                            className="form-select text-gray-100 mt-1 block w-full bg-gray-900 px-2 py-2 outline-none border border-gray-800 rounded-md"
                        >
                            <option value="">Pilih status...</option>
                            {data.statusChoice.map((item) => (
                                <option key={item.id_status} value={item.id_status}>{item.nama_status}</option>
                            ))}
                        </select>
                    </label>
                    <div className="flex justify-center items-center">
                        <button 
                            type="submit" 
                            className="btn-primary mx-auto my-4 px-4 py-2 text-gray-800 font-semibold rounded-lg bg-green-300 hover:bg-green-100"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

