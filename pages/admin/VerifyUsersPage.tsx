import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import { UserCheck, UserX } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import type { User } from '../../types';

const VerifyUsersPage: React.FC = () => {
    const { users, updateUserVerificationStatus } = useData();
    const { user: adminUser } = useAuth();
    const [confirmAction, setConfirmAction] = useState<{ user: User; action: 'verify' | 'reject' } | null>(null);
    
    const usersToVerify = users.filter(u => u.role === 'user' && u.freefireUid && !u.isUidVerified);

    const handleActionClick = (user: User, action: 'verify' | 'reject') => {
        setConfirmAction({ user, action });
    };
    
    const handleConfirmAction = () => {
        if (confirmAction && adminUser) {
            updateUserVerificationStatus(confirmAction.user.id, confirmAction.action === 'verify', adminUser.username);
            setConfirmAction(null);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-orange">Verify User In-Game Details</h1>
                <p className="text-brand-text-secondary mt-1">Review and approve user-submitted Free Fire account information.</p>
            </div>
            
            <div className="bg-brand-gray rounded-lg shadow-lg overflow-hidden border border-brand-light-gray">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand-light-gray">
                        <tr>
                            <th className="p-4">Username</th>
                            <th className="p-4">Free Fire UID</th>
                            <th className="p-4">In-Game Name</th>
                            <th className="p-4">Level</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {usersToVerify.length > 0 ? usersToVerify.map(user => (
                            <tr key={user.id} className="border-b border-brand-light-gray last:border-b-0">
                                <td className="p-4 font-semibold">{user.username}</td>
                                <td className="p-4 font-mono">{user.freefireUid}</td>
                                <td className="p-4">{user.inGameName}</td>
                                <td className="p-4">{user.inGameLevel}</td>
                                <td className="p-4 flex justify-center items-center gap-2">
                                    <Button onClick={() => handleActionClick(user, 'verify')} className="!py-1 !px-2 text-sm flex items-center gap-1">
                                        <UserCheck size={14}/> Verify
                                    </Button>
                                    <Button onClick={() => handleActionClick(user, 'reject')} variant="danger" className="!py-1 !px-2 text-sm flex items-center gap-1">
                                        <UserX size={14}/> Reject
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-brand-text-secondary">No users are currently awaiting verification.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirmAction}
                title={`${confirmAction?.action === 'verify' ? 'Verify' : 'Reject'} User`}
                message={
                    <p>
                        Are you sure you want to {confirmAction?.action} the in-game details for user "<strong>{confirmAction?.user.username}</strong>"?
                    </p>
                }
                confirmButtonText={`Yes, ${confirmAction?.action === 'verify' ? 'Verify' : 'Reject'}`}
                confirmButtonVariant={confirmAction?.action === 'reject' ? 'danger' : 'primary'}
            />
        </div>
    );
};

export default VerifyUsersPage;