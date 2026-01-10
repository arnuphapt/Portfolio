import React, { useState } from 'react';
import { db, storage, collection, addDoc, ref, uploadBytes, getDownloadURL } from '../../firebase';
import Swal from 'sweetalert2';

const AddCertificate = () => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload Image (Optional)
            let imageUrl = '';
            if (image) {
                const imageRef = ref(storage, `certificates/${image.name + Date.now()}`);
                const uploadResult = await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(uploadResult.ref);
            }

            // 2. Add to Firestore
            // Note: Assuming 'certificates' collection structure. Adjust fields if needed based on existing data.
            // 2. Add to Firestore
            // Note: Assuming 'certificates' collection structure. Adjust fields if needed based on existing data.
            /* await addDoc(collection(db, 'certificates'), {
                element: {
                    img: imageUrl,
                    name: name // or 'title' depending on your usage
                }
            }); */

            // WAIT: User screenshot for certificates showed a collection 'certificates' -> doc 'BEST AWARD...'
            // but didn't show fields inside.
            // However, usually it's just Image and Title.
            // Let's try to match a generic structure.

            const certificateData = {
                Img: imageUrl || "https://placehold.co/400x300?text=Certificate",
                Name: name
            };

            await addDoc(collection(db, 'certificates'), certificateData);

            Swal.fire({
                icon: 'success',
                title: 'Certificate Added!',
                text: 'Your certificate has been successfully added.',
                background: '#1f2937',
                color: '#fff'
            });

            setName('');
            setImage(null);

        } catch (error) {
            console.error("Error adding certificate: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-purple-400">Add New Certificate</h2>

            <div>
                <label className="block text-gray-400 mb-2">Certificate Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-400 mb-2">Certificate Image</label>
                <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 ${loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/30'
                    }`}
            >
                {loading ? 'Adding Certificate...' : 'Add Certificate'}
            </button>
        </form>
    );
};

export default AddCertificate;
