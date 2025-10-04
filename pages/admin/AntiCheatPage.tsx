import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import type { CheatReport, User } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { ShieldCheck, ShieldOff, Eye } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AntiCheatPage: React.FC = () => {
    const { user: adminUser } = useAuth();
    const { users, cheatReports, updateCheatReportStatus, updateUserBanStatus } = useData();
    const [viewingReport, setViewingReport] = useState<CheatReport | null>(null);
    const [banningUser, setBanningUser] = useState<User | null>(null);
    const [userToUnban, setUserToUnban] = useState<User | null>(null);
    const [banReason, setBanReason] = useState('');

    const handleBanUser = () => {
        if (banningUser && banReason && adminUser) {
            updateUserBanStatus(banningUser.id, true, adminUser.username, banReason);
            setBanningUser(null);
            setBanReason('');
        }
    };
    
    const handleUnbanClick = (user: User) => {
        setUserToUnban(user);
    };

    const handleConfirmUnban = () => {
        if (userToUnban && adminUser) {
            updateUserBanStatus(userToUnban.id, false, adminUser.username);
            setUserToUnban(null);
        }
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-orange">Anti-Cheat Management</h1>
                <p className="text-brand-text-secondary mt-1">Review cheat reports and manage user bans.</p>
            </div>

            {/* Cheat Reports Section */}
            <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
                <h2 className="text-xl font-semibold text-white mb-4">Cheat Reports</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand-light-gray">
                        <tr>
                            <th className="p-3">Reporter</th>
                            <th className="p-3">Reported</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cheatReports.map(report => (
                            <tr key={report.id} className="border-b border-brand-light-gray last:border-b-0">
                                <td className="p-3">{report.reporterUsername}</td>
                                <td className="p-3">{report.reportedUsername}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                    report.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                                    report.status === 'Reviewed' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`
                                    }>{report.status}</span>
                                </td>
                                <td className="p-3 text-sm">{new Date(report.timestamp).toLocaleDateString()}</td>
                                <td className="p-3 flex justify-center items-center gap-2">
                                    <Button onClick={() => setViewingReport(report)} variant="secondary" className="!py-1 !px-2 text-sm flex items-center gap-1"><Eye size={14}/> View</Button>
                                    {report.status === 'Pending' && <>
                                        <Button onClick={() => updateCheatReportStatus(report.id, 'Reviewed')} className="!py-1 !px-2 text-sm">Review</Button>
                                        <Button onClick={() => updateCheatReportStatus(report.id, 'Dismissed')} variant="danger" className="!py-1 !px-2 text-sm">Dismiss</Button>
                                    </>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Ban Management Section */}
            <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
                 <h2 className="text-xl font-semibold text-white mb-4">User Ban Management</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand-light-gray">
                        <tr>
                            <th className="p-3">Username</th>
                            <th className="p-3">Ban Status</th>
                            <th className="p-3">Ban Reason</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.filter(u => u.role === 'user').map(user => (
                            <tr key={user.id} className="border-b border-brand-light-gray last:border-b-0">
                                <td className="p-3 font-semibold">{user.username}</td>
                                <td className="p-3">
                                    {user.isBanned ? 
                                        <span className="text-red-400">Banned</span> : 
                                        <span className="text-green-400">Active</span>}
                                </td>
                                <td className="p-3 text-sm">{user.banReason || 'N/A'}</td>
                                <td className="p-3 text-center">
                                    {user.isBanned ? 
                                    <Button onClick={() => handleUnbanClick(user)} variant="primary" className="!py-1 !px-2 text-sm flex items-center gap-1 mx-auto"><ShieldCheck size={14}/> Unban</Button> : 
                                    <Button onClick={() => setBanningUser(user)} variant="danger" className="!py-1 !px-2 text-sm flex items-center gap-1 mx-auto"><ShieldOff size={14}/> Ban</Button>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Report Modal */}
            <Modal isOpen={!!viewingReport} onClose={() => setViewingReport(null)} title="View Cheat Report">
                {viewingReport && <div className="space-y-3 text-sm">
                    <p><strong className="text-brand-text-secondary">Reporter:</strong> {viewingReport.reporterUsername}</p>
                    <p><strong className="text-brand-text-secondary">Reported:</strong> {viewingReport.reportedUsername}</p>
                    <p><strong className="text-brand-text-secondary">Description:</strong> {viewingReport.description}</p>
                    <div><strong className="text-brand-text-secondary">Screenshot:</strong></div>
                    {viewingReport.screenshotPath ? 
                        <img src={viewingReport.screenshotPath} alt="Evidence" className="rounded-lg border border-gray-600 max-h-64 w-full object-contain" /> :
                        <p className="text-gray-400">No screenshot provided.</p>
                    }
                </div>}
            </Modal>
            
            {/* Ban Reason Modal */}
            <Modal isOpen={!!banningUser} onClose={() => setBanningUser(null)} title={`Ban ${banningUser?.username}`}>
                <div className="space-y-4">
                    <Input label="Reason for Ban" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="e.g., Use of third-party cheats"/>
                    <Button onClick={handleBanUser} variant="danger" className="w-full">Confirm Ban</Button>
                </div>
            </Modal>

            {/* Unban Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!userToUnban}
                onClose={() => setUserToUnban(null)}
                onConfirm={handleConfirmUnban}
                title="Unban User"
                message={<p>Are you sure you want to unban <strong>{userToUnban?.username}</strong>? They will regain full access to the app.</p>}
                confirmButtonText="Yes, Unban"
                confirmButtonVariant="primary"
            />
        </div>
    );
};

export default AntiCheatPage;
