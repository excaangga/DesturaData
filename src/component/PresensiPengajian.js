import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './SupabaseClient';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function PresensiPengajian() {
  const { idKelompok } = useParams();
  const [kelompokName, setKelompokName] = useState('');
  const [persons, setPersons] = useState([]);
  const [pengajianList, setPengajianList] = useState([]);
  const [selectedPengajianId, setSelectedPengajianId] = useState(null);
  const [presensiData, setPresensiData] = useState({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [currentPersonId, setCurrentPersonId] = useState(null);

  // Fetching kelompok name
  useEffect(() => {
    async function fetchKelompokName() {
      const { data, error } = await supabase
        .from('KELOMPOK')
        .select('nama_kelompok')
        .eq('id_kelompok', idKelompok)
        .single();

      if (error) {
        console.error("Error fetching kelompok name:", error);
        return;
      }

      setKelompokName(data.nama_kelompok);
    }

    fetchKelompokName();
  }, [idKelompok]);

  // Fetching persons
  useEffect(() => {
    async function fetchPersons() {
      const { data, error } = await supabase
        .from('PERSON')
        .select('*')
        .eq('id_kelompok', idKelompok);

      if (error) {
        console.error("Error fetching persons:", error);
        return;
      }

      setPersons(data);
    }

    fetchPersons();
  }, [idKelompok]);

  // Fetching pengajian
  useEffect(() => {
    async function fetchPengajian() {
      const { data, error } = await supabase
        .from('PENGAJIAN')
        .select('*')
        .order('held_at', { ascending: false });

      if (error) {
        console.error("Error fetching pengajian:", error);
        return;
      }

      setPengajianList(data);
    }

    fetchPengajian();
  }, []);

  // Fetching presensi data
  useEffect(() => {
    if (!selectedPengajianId) return;

    async function fetchPresensiData() {
      const { data, error } = await supabase
        .from('PRESENSI')
        .select('person_id, is_present, attended_at, note')
        .eq('pengajian_id', selectedPengajianId);

      if (error) {
        console.error("Error fetching presensi data:", error);
        return;
      }

      const presensiMap = data.reduce((acc, record) => {
        acc[record.person_id] = {
          is_present: record.is_present,
          attended_at: record.attended_at,
          note: record.note,
        };
        return acc;
      }, {});

      setPresensiData(presensiMap);
    }

    fetchPresensiData();
  }, [selectedPengajianId]);

  // Handle presence change
  async function handlePresenceChange(personId) {
    setPresensiData((prev) => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        is_present: !prev[personId]?.is_present,
        attended_at: !prev[personId]?.is_present ? new Date().toISOString() : null,
      }
    }));
  }

  // Save attendance
  async function saveAttendance() {
    if (!selectedPengajianId) {
      alert("Pilih pengajian terlebih dahulu.");
      return;
    }

    const recordsToUpdate = persons
      .filter(person => presensiData[person.id_person] !== undefined)
      .map(person => ({
        person_id: person.id_person,
        pengajian_id: selectedPengajianId,
        is_present: presensiData[person.id_person].is_present ? true : false,
        attended_at: presensiData[person.id_person].is_present ? presensiData[person.id_person].attended_at : null,
        note: presensiData[person.id_person].note || null,
      }));

    const { error } = await supabase
      .from('PRESENSI')
      .upsert(recordsToUpdate, { onConflict: ['person_id', 'pengajian_id'] });

    if (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance.");
    } else {
      console.log("Attendance saved successfully.");
      alert("Sukses menyimpan presensi.");
    }
  }

  // Open note modal
  function openNoteModal(personId) {
    setCurrentPersonId(personId);
    setCurrentNote(presensiData[personId]?.note || '');
    setShowNoteModal(true);
  }

  // Save note
  async function saveNote() {
    setPresensiData((prev) => ({
      ...prev,
      [currentPersonId]: {
        ...prev[currentPersonId],
        note: currentNote,
      }
    }));

    setShowNoteModal(false);
  }

  // Delete note function
  function deleteNote(personId) {
    setPresensiData((prev) => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        note: '', // Clear the note
      }
    }));
  }

  return (
    <div>
      <div className='px-5 py-5 text-2xl text-gray-100 border-b border-gray-500'>
        Presensi Pengajian {kelompokName && ` - ${kelompokName}`}
      </div>

      <div className="m-4 flex gap-4 justify-center items-center">
        <label>Pilih Pengajian:</label>
        <select
          value={selectedPengajianId || ''}
          onChange={(e) => setSelectedPengajianId(e.target.value)}
          className="text-gray-100 px-2 py-2 bg-gray-900 border border-gray-800 rounded-md"
        >
          <option value="">Pilih Pengajian</option>
          {pengajianList.map((pengajian) => (
            <option key={pengajian.id} value={pengajian.id}>
              {new Date(pengajian.held_at).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {selectedPengajianId && 
        <div className="overflow-x-auto">
          <table className="bg-gray-900 m-4 p-4 w-full">
            <thead>
              <tr>
                <th className="p-4">No.</th>
                <th className="p-4">Nama</th>
                <th className="p-4">Kehadiran</th>
                <th className="p-4">Waktu Kehadiran</th>
                <th className="p-4">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((person, index) => (
                <tr key={person.id_person}>
                  <td className="text-center py-2">{index + 1}</td>
                  <td className="no-wrap w-full py-2">{person.nama_person}</td>
                  <td className="text-center py-2">
                    <input
                      type="checkbox"
                      checked={!!presensiData[person.id_person]?.is_present}
                      onChange={() => handlePresenceChange(person.id_person)}
                    />
                  </td>
                  <td className="text-center py-2">
                    {presensiData[person.id_person]?.attended_at
                      ? new Date(presensiData[person.id_person].attended_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Jakarta',
                        }) + ' WIB'
                      : '-'}
                  </td>
                  <td className="text-center py-2">
                    {presensiData[person.id_person]?.note ? (
                      <div className="flex items-center">
                        {presensiData[person.id_person].note}
                        <button
                          onClick={() => deleteNote(person.id_person)}
                          className="ml-2 text-red-500"
                          title="Hapus Catatan"
                        >
                          &#10006;
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <button
                          onClick={() => openNoteModal(person.id_person)}
                          className="bg-blue-500 text-white px-2 py-1 rounded w-44"
                        >
                          Tambah Catatan
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }

      {selectedPengajianId && 
        <div className="flex justify-center items-center m-4">
          <button
            onClick={saveAttendance}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
          >
            Simpan Kehadiran
          </button>
        </div>
      }

      <Modal
        isOpen={showNoteModal} // This controls whether the modal is open
        onRequestClose={() => setShowNoteModal(false)} // Close the modal
        className="modal mx-auto mt-10 max-w-md bg-gray-800 p-4 rounded-lg text-gray-100 w-[90%]"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50"
    >
        <form onSubmit={(e) => { e.preventDefault(); saveNote(); }} className="space-y-4">
            <h2 className="text-lg mb-4">Tambah Catatan</h2>
            <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-gray-900 text-gray-100"
                rows="4"
                placeholder="Tambahkan catatan disini..."
            ></textarea>
            <div className="flex justify-end">
                <button
                    type="button" // Change to "button" since it's not a form submission
                    onClick={() => setShowNoteModal(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
                >
                    Batal
                </button>
                <button
                    type="submit" // Keep this for the save action
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Simpan
                </button>
            </div>
        </form>
    </Modal>
    </div>
  );
}
