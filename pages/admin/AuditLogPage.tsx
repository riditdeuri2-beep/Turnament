import React from 'react';
import { useData } from '../../contexts/DataContext';
import { History, User, Shield } from 'lucide-react';

const AuditLogPage: React.FC = () => {
    const { auditLogs } = useData();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-orange flex items-center gap-3">
                    <History /> Admin Audit Log
                </h1>
                <p className="text-brand-text-secondary mt-1">A chronological record of all administrative actions taken on the platform.</p>
            </div>
            
            <div className="bg-brand-gray rounded-lg shadow-lg overflow-hidden border border-brand-light-gray">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand-light-gray">
                            <tr>
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Admin</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.length > 0 ? auditLogs.map(log => (
                                <tr key={log.id} className="border-b border-brand-light-gray last:border-b-0">
                                    <td className="p-4 text-sm text-brand-text-secondary whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4 font-semibold">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-brand-orange" />
                                            {log.adminUsername}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-brand-text-secondary" />
                                            {log.action}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-mono text-gray-400">{log.target}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-brand-text-secondary">
                                        No administrative actions have been logged yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogPage;