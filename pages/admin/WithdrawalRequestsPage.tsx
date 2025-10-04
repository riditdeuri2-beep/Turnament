import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import type { Withdrawal } from '../../types';

const WithdrawalRequestsPage: React.FC = () => {
  const { withdrawals, updateWithdrawalStatus } = useData();
  const { user: adminUser } = useAuth();
  const [confirmAction, setConfirmAction] = useState<{ request: Withdrawal, status: 'Completed' | 'Rejected' } | null>(null);

  const handleActionClick = (request: Withdrawal, status: 'Completed' | 'Rejected') => {
    setConfirmAction({ request, status });
  };

  const handleConfirmAction = () => {
    if (confirmAction && adminUser) {
        updateWithdrawalStatus(confirmAction.request.id, confirmAction.status, adminUser.username);
        setConfirmAction(null);
    } else if (!adminUser) {
        alert("Could not find admin user. Please log in again.");
        setConfirmAction(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-orange mb-8">Withdrawal Requests</h1>
      <div className="bg-brand-gray rounded-lg shadow-lg overflow-hidden border border-brand-light-gray">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-light-gray">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Amount</th>
                <th className="p-4">UPI ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(req => (
                <tr key={req.id} className="border-b border-brand-light-gray last:border-b-0">
                  <td className="p-4 font-semibold">{req.username}</td>
                  <td className="p-4">₹{req.amount.toFixed(2)}</td>
                  <td className="p-4 font-mono text-sm">{req.upiId || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      req.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                      req.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`
                    }>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-brand-text-secondary">{new Date(req.timestamp).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    {req.status === 'Pending' && (
                      <div className="flex justify-center gap-2">
                        <Button onClick={() => handleActionClick(req, 'Completed')} className="!py-1 !px-2 text-sm">Approve</Button>
                        <Button onClick={() => handleActionClick(req, 'Rejected')} variant="danger" className="!py-1 !px-2 text-sm">Reject</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={`${confirmAction?.status === 'Completed' ? 'Approve' : 'Reject'} Withdrawal`}
        message={
            <p>
                Are you sure you want to {confirmAction?.status === 'Completed' ? 'approve' : 'reject'} this withdrawal request of <strong>₹{confirmAction?.request.amount.toFixed(2)}</strong> for user <strong>{confirmAction?.request.username}</strong>? Approving this is irreversible.
            </p>
        }
        confirmButtonText={`Yes, ${confirmAction?.status === 'Completed' ? 'Approve' : 'Reject'}`}
        confirmButtonVariant={confirmAction?.status === 'Rejected' ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default WithdrawalRequestsPage;
