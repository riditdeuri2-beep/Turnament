import React, { useState, ChangeEvent } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Upload, KeyRound, Bot, Link as LinkIcon, DollarSign } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, updateUserPassword } = useData();
  const { user: adminUser } = useAuth();
  
  const [formState, setFormState] = useState({
    upiId: settings.upiId,
    qrCodePath: settings.qrCodePath,
    geminiApiKey: settings.geminiApiKey || '',
    shareLink: settings.shareLink || '',
    minBetAmount: settings.minBetAmount || 10,
    maxBetAmount: settings.maxBetAmount || 500,
    dailyBetLimit: settings.dailyBetLimit || 2000,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleQrCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormState(prev => ({...prev, qrCodePath: event.target?.result as string}));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if(adminUser) {
        updateSettings({ 
            ...formState,
            minBetAmount: Number(formState.minBetAmount),
            maxBetAmount: Number(formState.maxBetAmount),
            dailyBetLimit: Number(formState.dailyBetLimit),
        }, adminUser.username);
    }
  };

  const handleChangePassword = () => {
    if (!adminUser) return;
    if (adminUser.password !== passwordData.currentPassword) {
        updateUserPassword(adminUser.id, ''); // This will trigger the "Current password does not match" notification
        return;
    }
    const success = updateUserPassword(adminUser.id, passwordData.newPassword);
    if(success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-orange">App Settings</h1>
      
      <div className="max-w-xl mx-auto bg-brand-gray p-8 rounded-lg shadow-lg border border-brand-light-gray">
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">General Settings</h2>
            <Input 
                label="UPI ID for Deposits"
                name="upiId"
                value={formState.upiId}
                onChange={handleFormChange}
                placeholder="your-business@upi"
            />
            <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Deposit QR Code Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        {formState.qrCodePath ? (
                            <img src={formState.qrCodePath} alt="QR Code" className="mx-auto h-32 w-32 object-contain"/>
                        ) : (
                            <Upload size={48} className="mx-auto text-gray-500" />
                        )}
                        <div className="flex text-sm text-gray-400">
                            <label htmlFor="qrCodeInput" className="relative cursor-pointer bg-brand-dark rounded-md font-medium text-brand-orange hover:text-orange-400 focus-within:outline-none p-1">
                                <span>Upload a file</span>
                                <input id="qrCodeInput" name="qrCodeInput" type="file" className="sr-only" onChange={handleQrCodeChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 1MB</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-brand-light-gray">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><LinkIcon /> App Sharing</h3>
                <Input 
                    label="Website / App Share Link"
                    name="shareLink"
                    value={formState.shareLink}
                    onChange={handleFormChange}
                    placeholder="https://yourapp.com/share?ref=..."
                />
            </div>

            <div className="pt-6 border-t border-brand-light-gray">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><DollarSign /> Betting Limits</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <Input 
                        label="Min Bet (₹)"
                        name="minBetAmount"
                        type="number"
                        value={formState.minBetAmount}
                        onChange={handleFormChange}
                    />
                    <Input 
                        label="Max Bet (₹)"
                        name="maxBetAmount"
                        type="number"
                        value={formState.maxBetAmount}
                        onChange={handleFormChange}
                    />
                     <Input 
                        label="Daily Limit (₹)"
                        name="dailyBetLimit"
                        type="number"
                        value={formState.dailyBetLimit}
                        onChange={handleFormChange}
                    />
                </div>
            </div>

            {adminUser?.role === 'superadmin' && (
                <div className="pt-6 border-t border-brand-light-gray">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Bot /> Gemini API</h3>
                    <Input 
                        label="Private Gemini API Key"
                        name="geminiApiKey"
                        type="password"
                        value={formState.geminiApiKey}
                        onChange={handleFormChange}
                        placeholder="Enter your Gemini API key"
                    />
                </div>
            )}

            <Button onClick={handleSave} className="w-full !mt-8">Save All Settings</Button>
        </div>
      </div>
      
      {adminUser?.role === 'superadmin' && (
         <div className="max-w-xl mx-auto bg-brand-gray p-8 rounded-lg shadow-lg border border-brand-light-gray">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><KeyRound/> Change Super Admin Password</h2>
            <div className="space-y-4">
                <Input label="Current Password" type="password" value={passwordData.currentPassword} onChange={e => setPasswordData(p=>({...p, currentPassword: e.target.value}))} />
                <Input label="New Password" type="password" value={passwordData.newPassword} onChange={e => setPasswordData(p=>({...p, newPassword: e.target.value}))} />
                <Input label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData(p=>({...p, confirmPassword: e.target.value}))} />
                <Button onClick={handleChangePassword} className="w-full" variant="secondary">Update Password</Button>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;