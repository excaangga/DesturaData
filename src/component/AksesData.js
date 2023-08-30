import { useParams } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';

const supabaseUrl = 'https://fjqkgesfphrdvtuvgxvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcWtnZXNmcGhyZHZ0dXZneHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTMyNDUxMzksImV4cCI6MjAwODgyMTEzOX0.OqCMygU_Y1ugMtXRrN7YPQuGSqOWJ9cT3AFAqFF-BEw';
const supabase = createClient(supabaseUrl, supabaseKey);
export default function AksesData() {
    const { idKelompok } = useParams();
    const [loading, setLoading] = useState(true);
    const [PERSON, setPERSON] = useState(null);
    const [KELOMPOK, setKELOMPOK] = useState(null);

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

    useEffect(() => {
        fetchData();
    }, [idKelompok]);

    const handleAddRecord = () => {
        // Implement the logic to show a modal or navigate to a form for adding records
    };

    const handleEdit = (personId) => {
        // Implement edit functionality using Supabase for the specific person with personId
        // For example: navigate to an edit page with the person's data
    };

    const handleDelete = async (personId) => {
        const { error } = await supabase.from('PERSON').delete().eq('id_person', personId);
        if (!error) {
            // Refresh the data after deleting
            fetchData();
        }
    };

    return (
        <div className="flex-grow">
            {loading ? (
                <div className="h-full flex justify-center items-center">Loading...</div>
            )
                :
                (
                    <div>
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
                                </div>
                                <div className="flex justify-center mt-4">
                                    <button className="mr-3 w-14 rounded-md py-1 bg-yellow-300 text-xs text-gray-800" onClick={() => handleEdit(item.id_person)}>Edit</button>
                                    <button className="w-14 rounded-md py-1 bg-red-300 text-xs text-gray-800" onClick={() => handleDelete(item.id_person)}>Delete</button>
                                </div>
                            </div>
                        ))}
                        {/* FAB */}
                        <div className="fixed bottom-10 right-10">
                            <button
                                className="w-12 h-12 bg-green-300 text-white rounded-full shadow-lg flex items-center justify-center"
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
        </div>
    );
}
