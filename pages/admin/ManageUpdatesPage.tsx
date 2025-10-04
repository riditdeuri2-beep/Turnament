import React, { useState, ChangeEvent } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Upload, X } from 'lucide-react';

const ManageUpdatesPage: React.FC = () => {
    const { user } = useAuth();
    const { adminUpdates, addAdminUpdate } = useData();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = () => {
        if (!title || !content) {
            alert('Please fill out both title and content.');
            return;
        }

        let imagePath: string | undefined = undefined;
        if (imageFile) {
            imagePath = URL.createObjectURL(imageFile);
        }

        addAdminUpdate({ title, content, imagePath });
        
        setTitle('');
        setContent('');
        removeImage();
        alert('Update posted successfully!');
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-orange">Manage App Updates</h1>
                <p className="text-brand-text-secondary mt-1">Post announcements and updates for all users to see.</p>
            </div>

            <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray space-y-4">
                <h2 className="text-xl font-semibold text-white">Create New Update</h2>
                <Input
                    label="Title"
                    placeholder="e.g., Server Maintenance"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-brand-text-secondary mb-1">Content</label>
                    <textarea
                        id="content"
                        rows={4}
                        placeholder="Write the details of the update here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-brand-light-gray border border-gray-600 text-brand-text rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                    />
                </div>

                {user?.role === 'superadmin' && (
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Upload Image (Optional)</label>
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-contain rounded-md border border-gray-600"/>
                                <button onClick={removeImage} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/80">
                                    <X size={18}/>
                                </button>
                            </div>
                        ) : (
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <Upload size={48} className="mx-auto text-gray-500" />
                                    <div className="flex text-sm text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-brand-dark rounded-md font-medium text-brand-orange hover:text-orange-400 p-1">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <Button onClick={handleSubmit} className="w-full">Post Update</Button>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Posted Updates</h2>
                {adminUpdates.length > 0 ? (
                    adminUpdates.map(update => (
                        <div key={update.id} className="bg-brand-gray p-4 rounded-lg border border-brand-light-gray">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-brand-orange">{update.title}</h3>
                                <span className="text-xs text-brand-text-secondary">{new Date(update.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-brand-text-secondary mt-2">{update.content}</p>
                            {update.imagePath && (
                                <img src={update.imagePath} alt={update.title} className="mt-4 rounded-lg w-full max-h-80 object-cover border border-brand-light-gray" />
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-brand-text-secondary">No updates have been posted yet.</p>
                )}
            </div>
        </div>
    );
};

export default ManageUpdatesPage;