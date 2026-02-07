import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import toast from 'react-hot-toast';

/**
 * Status Update Modal Component
 * Modal for updating issue status with optional resolution proof
 */
const StatusUpdateModal = ({ isOpen, onClose, issue, onSubmit, loading = false }) => {
    const [status, setStatus] = useState(issue?.status || 'reported');
    const [note, setNote] = useState('');
    const [images, setImages] = useState([]);

    const isResolution = status === 'resolved';

    // Reset form when modal opens
    const resetForm = () => {
        setStatus(issue?.status || 'reported');
        setNote('');
        setImages([]);
    };

    // Image dropzone for resolution proof
    const onDrop = useCallback((acceptedFiles) => {
        if (images.length >= 3) {
            toast.error('Maximum 3 images allowed for resolution proof');
            return;
        }

        const newFiles = acceptedFiles.slice(0, 3 - images.length).map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        );

        setImages((prev) => [...prev, ...newFiles]);
    }, [images]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxSize: 5 * 1024 * 1024,
        disabled: !isResolution,
    });

    const removeImage = (index) => {
        setImages((prev) => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!note.trim()) {
            toast.error('Please add a note');
            return;
        }

        if (isResolution) {
            // Submit with images for resolution
            const formData = new FormData();
            formData.append('note', note);
            images.forEach((image) => {
                formData.append('images', image);
            });
            onSubmit(issue._id, formData, true);
        } else {
            // Submit status update
            onSubmit(issue._id, { status, note }, false);
        }

        resetForm();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!issue) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Update Issue Status" size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Info */}
                <div className="bg-dark-700/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">{issue.title}</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-dark-400 text-sm">Current status:</span>
                        <StatusBadge status={issue.status} size="sm" />
                    </div>
                </div>

                {/* New Status */}
                <div>
                    <label className="block text-dark-200 text-sm font-medium mb-2">
                        New Status
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {['reported', 'in_progress', 'resolved'].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${status === s
                                        ? 'bg-primary-600 border-primary-500 !text-white'
                                        : 'bg-dark-700 border-dark-600 text-dark-300 hover:border-dark-500'
                                    }`}
                            >
                                {s === 'reported' && 'Reported'}
                                {s === 'in_progress' && 'In Progress'}
                                {s === 'resolved' && 'Resolved'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Note */}
                <div>
                    <label className="block text-dark-200 text-sm font-medium mb-2">
                        Note *
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={
                            isResolution
                                ? 'Describe how the issue was resolved...'
                                : 'Add a note about this status update...'
                        }
                        className="input-field min-h-[100px] resize-y"
                        maxLength={1000}
                    />
                </div>

                {/* Resolution Proof (only for resolved status) */}
                {isResolution && (
                    <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                            Resolution Proof (Photos)
                        </label>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-dark-600 hover:border-primary-500 hover:bg-dark-700/50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload
                                size={32}
                                className={`mx-auto mb-2 ${isDragActive ? 'text-primary-400' : 'text-dark-400'
                                    }`}
                            />
                            <p className="text-dark-300 text-sm">
                                {isDragActive
                                    ? 'Drop images here...'
                                    : 'Upload photos showing the resolved issue'}
                            </p>
                            <p className="text-dark-500 text-xs mt-1">Max 3 images, 5MB each</p>
                        </div>

                        {/* Image Previews */}
                        {images.length > 0 && (
                            <div className="flex gap-3 mt-4">
                                {images.map((file, index) => (
                                    <div key={file.name} className="relative group">
                                        <img
                                            src={file.preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant={isResolution ? 'success' : 'primary'}
                        loading={loading}
                    >
                        {isResolution ? 'Mark as Resolved' : 'Update Status'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default StatusUpdateModal;
