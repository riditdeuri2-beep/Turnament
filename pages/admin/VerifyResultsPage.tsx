import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Check, X, Bot, User, BarChart } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const VerifyResultsPage: React.FC = () => {
    const { tournaments, tournamentResults, verifyNormalModeResult, verifyKillModeResult } = useData();
    const { user: adminUser } = useAuth();
    const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

    type ConfirmResultAction = {
        type: 'normal' | 'kill';
        action: 'Approve' | 'Reject';
        id: number;
        tournamentId?: number;
        userId?: number;
        displayInfo: string;
    };
    const [confirmAction, setConfirmAction] = useState<ConfirmResultAction | null>(null);


    const pendingKillResults = tournaments
        .flatMap(t => (t.results || []).map(r => ({ ...r, tournamentName: t.name, tournamentId: t.id })))
        .filter(r => r.status === 'PendingVerification');

    const pendingNormalResults = tournamentResults.filter(r => r.status === 'Pending');

    const handleActionClick = (action: 'Approve' | 'Reject', type: 'normal' | 'kill', result: any) => {
        if (type === 'normal') {
            setConfirmAction({
                action,
                type,
                id: result.id,
                displayInfo: `result for ${result.username} in "${result.tournamentName}"`
            });
        } else { // kill
            setConfirmAction({
                action,
                type,
                id: -1, // Not used directly
                tournamentId: result.tournamentId,
                userId: result.userId,
                displayInfo: `result for ${result.username} in "${result.tournamentName}"`
            });
        }
    };

    const handleConfirmAction = () => {
        if (!confirmAction || !adminUser) return;

        const status = confirmAction.action === 'Approve' ? 'Verified' : 'Rejected';

        if (confirmAction.type === 'normal') {
            verifyNormalModeResult(confirmAction.id, status, adminUser.username);
        } else if (confirmAction.type === 'kill' && confirmAction.tournamentId && confirmAction.userId) {
            verifyKillModeResult(confirmAction.tournamentId, confirmAction.userId, status, adminUser.username);
        }

        setConfirmAction(null);
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-orange">Verify Tournament Results</h1>
                <p className="text-brand-text-secondary mt-1">Approve or reject submitted results to finalize tournaments and distribute rewards.</p>
            </div>

            {/* Normal Mode Pending Results */}
            <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
                <h2 className="text-xl font-semibold text-white mb-4">Pending Normal Mode Results (User Submitted)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-brand-light-gray">
                        <tr>
                            <th className="p-3">Tournament</th>
                            <th className="p-3">Player</th>
                            <th className="p-3">Submitted Rank</th>
                            <th className="p-3">AI Analysis</th>
                            <th className="p-3">Screenshot</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pendingNormalResults.length > 0 ? pendingNormalResults.map(r => (
                            <tr key={r.id} className="border-b border-brand-light-gray last:border-b-0">
                                <td className="p-3 font-semibold">{r.tournamentName}</td>
                                <td className="p-3">{r.username}</td>
                                <td className="p-3 flex items-center gap-2"><User size={14}/> <strong>#{r.rank}</strong></td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <Bot size={14} className={ (r.aiConfidence ?? 0) < 0.7 ? 'text-red-400' : 'text-green-400' }/>
                                        <span>Rank: <strong>#{r.aiRank ?? 'N/A'}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BarChart size={14} className={ (r.aiConfidence ?? 0) < 0.7 ? 'text-red-400' : 'text-green-400' }/>
                                        <span>Confidence: <strong>{((r.aiConfidence ?? 0) * 100).toFixed(0)}%</strong></span>
                                    </div>
                                </td>
                                <td className="p-3"><Button variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => setViewingScreenshot(r.screenshotPath)}>View Proof</Button></td>
                                <td className="p-3 flex justify-center items-center gap-2">
                                    <Button onClick={() => handleActionClick('Approve', 'normal', r)} className="!py-1 !px-2 text-xs flex items-center gap-1"><Check size={14}/> Approve</Button>
                                    <Button onClick={() => handleActionClick('Reject', 'normal', r)} variant="danger" className="!py-1 !px-2 text-xs flex items-center gap-1"><X size={14}/> Reject</Button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan={6} className="p-8 text-center text-brand-text-secondary">No pending Normal mode results.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Kill Mode Pending Results */}
            <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
                <h2 className="text-xl font-semibold text-white mb-4">Pending Kill Mode Results (Admin Submitted)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-brand-light-gray">
                        <tr>
                            <th className="p-3">Tournament</th>
                            <th className="p-3">Player</th>
                            <th className="p-3">Submitted Kills</th>
                            <th className="p-3">AI Analysis</th>
                            <th className="p-3">Screenshot</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pendingKillResults.length > 0 ? pendingKillResults.map(r => (
                            <tr key={`${r.tournamentId}-${r.userId}`} className="border-b border-brand-light-gray last:border-b-0">
                                <td className="p-3 font-semibold">{r.tournamentName}</td>
                                <td className="p-3">{r.username}</td>
                                <td className="p-3 flex items-center gap-2"><User size={14}/> <strong>{r.kills}</strong></td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <Bot size={14} className={ (r.aiConfidence ?? 0) < 0.7 ? 'text-red-400' : 'text-green-400' }/>
                                        <span>Kills: <strong>{r.aiKillCount ?? 'N/A'}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BarChart size={14} className={ (r.aiConfidence ?? 0) < 0.7 ? 'text-red-400' : 'text-green-400' }/>
                                        <span>Confidence: <strong>{((r.aiConfidence ?? 0) * 100).toFixed(0)}%</strong></span>
                                    </div>
                                </td>
                                <td className="p-3"><Button variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => r.screenshotPath && setViewingScreenshot(r.screenshotPath)}>View Proof</Button></td>
                                <td className="p-3 flex justify-center items-center gap-2">
                                    <Button onClick={() => handleActionClick('Approve', 'kill', r)} className="!py-1 !px-2 text-xs flex items-center gap-1"><Check size={14}/> Approve</Button>
                                    <Button onClick={() => handleActionClick('Reject', 'kill', r)} variant="danger" className="!py-1 !px-2 text-xs flex items-center gap-1"><X size={14}/> Reject</Button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan={6} className="p-8 text-center text-brand-text-secondary">No pending Kill mode results.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={!!viewingScreenshot} onClose={() => setViewingScreenshot(null)} title="Screenshot Proof">
                {viewingScreenshot && <img src={viewingScreenshot} alt="Proof" className="rounded-lg w-full h-auto object-contain" />}
            </Modal>

            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirmAction}
                title={`${confirmAction?.action} Result`}
                message={
                    <p>
                        Are you sure you want to {confirmAction?.action.toLowerCase()} this {confirmAction?.displayInfo}? This may involve transferring funds and cannot be undone.
                    </p>
                }
                confirmButtonText={`Yes, ${confirmAction?.action}`}
                confirmButtonVariant={confirmAction?.action === 'Reject' ? 'danger' : 'primary'}
            />
        </div>
    );
};

export default VerifyResultsPage;