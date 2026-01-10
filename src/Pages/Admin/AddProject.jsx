import React, { useState } from 'react';
import { db, storage, collection, addDoc, ref, uploadBytes, getDownloadURL } from '../../firebase';
import Swal from 'sweetalert2';

const AddProject = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        github: '',
        demo: '', // live link
        techStack: '', // comma separatedString
    });
    const [features, setFeatures] = useState(['']);
    const [image, setImage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const addFeatureField = () => {
        setFeatures([...features, '']);
    };

    const removeFeatureField = (index) => {
        const newFeatures = features.filter((_, i) => i !== index);
        setFeatures(newFeatures);
    };

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
                const imageRef = ref(storage, `projects/${image.name + Date.now()}`);
                const uploadResult = await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(uploadResult.ref);
            }

            // 2. Prepare Data
            const projectData = {
                Title: formData.title,
                Description: formData.description,
                Github: formData.github,
                Link: formData.demo,
                Img: imageUrl || "https://placehold.co/600x400?text=Project+Image",
                TechStack: formData.techStack.split(',').map(item => item.trim()).filter(item => item),
                Features: features.filter(f => f.trim() !== '')
            };

            // 3. Add to Firestore
            await addDoc(collection(db, 'projects'), projectData);

            Swal.fire({
                icon: 'success',
                title: 'Project Added!',
                text: 'Your project has been successfully added.',
                background: '#1f2937',
                color: '#fff'
            });

            // Reset Form
            setFormData({
                title: '',
                description: '',
                github: '',
                demo: '',
                techStack: ''
            });
            setFeatures(['']);
            setImage(null);

        } catch (error) {
            console.error("Error adding project: ", error);
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
            <h2 className="text-xl font-semibold text-blue-400">Add New Project</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-400 mb-2">Project Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-400 mb-2">Tech Stack (comma separated)</label>
                    <input
                        type="text"
                        name="techStack"
                        value={formData.techStack}
                        onChange={handleChange}
                        placeholder="React, Firebase, Tailwind"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-gray-400 mb-2">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-400 mb-2">Github Link</label>
                    <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-2">Live Demo Link</label>
                    <input
                        type="url"
                        name="demo"
                        value={formData.demo}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-gray-400 mb-2">Features</label>
                {features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={`Feature ${index + 1}`}
                        />
                        {features.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeFeatureField(index)}
                                className="bg-red-500/20 text-red-500 p-3 rounded-lg hover:bg-red-500/30"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addFeatureField}
                    className="text-sm text-blue-400 hover:text-blue-300 mt-1"
                >
                    + Add Feature
                </button>
            </div>

            <div>
                <label className="block text-gray-400 mb-2">Project Image</label>
                <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 ${loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30'
                    }`}
            >
                {loading ? 'Adding Project...' : 'Add Project'}
            </button>
        </form>
    );
};

export default AddProject;
