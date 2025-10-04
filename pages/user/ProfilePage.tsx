import React, { useState, ChangeEvent, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData, isVipActive } from '../../contexts/DataContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { User, Camera, ShieldCheck, ShieldAlert, KeyRound, Gamepad2, Mail, Banknote, LogOut, Crown, Share2, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateUserPassword, leaveGuild, updateUserProfile } = useData();

  const [formData, setFormData] = useState({
      username: user?.username || '',
      upiId: user?.upiId || '',
      freefireUid: user?.freefireUid || '',
      inGameName: user?.inGameName || '',
      inGameLevel: user?.inGameLevel?.toString() || '',
  });

  const [profilePic, setProfilePic] = useState(user?.profilePicPath);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChanged, setIsChanged] = useState(false);
  const [isLeaveGuildModalOpen, setLeaveGuildModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  
  const userIsVip = isVipActive(user?.vipExpiry);

  useEffect(() => {
    if (user) {
        setFormData({
            username: user.username,
            upiId: user.upiId || '',
            freefireUid: user.freefireUid || '',
            inGameName: user.inGameName || '',
            inGameLevel: user.inGameLevel?.toString() || '',
        });
        setProfilePic(user.profilePicPath);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
        const hasFormChanged = formData.username !== user.username ||
                              formData.upiId !== (user.upiId || '') ||
                              formData.freefireUid !== (user.freefireUid || '') ||
                              formData.inGameName !== (user.inGameName || '') ||
                              formData.inGameLevel !== (user.inGameLevel?.toString() || '') ||
                              profilePic !== user.profilePicPath;
        setIsChanged(hasFormChanged);
    }
  }, [formData, profilePic, user]);


  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleProfilePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!user) return;
    const level = parseInt(formData.inGameLevel) || 0;

    const updatedDetails = {
        ...formData,
        profilePicPath: profilePic,
        inGameLevel: level,
    };
    
    const success = updateUserProfile(user.id, updatedDetails);
    
    if (success) {
        setIsChanged(false);
    }
  };
  
  const handleChangePassword = () => {
    if (!user) return;
    if (user.password !== passwordData.currentPassword) {
        updateUserPassword(user.id, ''); // Will trigger "Current password does not match."
        return;
    }
    const success = updateUserPassword(user.id, passwordData.newPassword);
    if(success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }
  
  const handleLeaveGuild = () => {
      if(!user) return;
      leaveGuild(user.id);
      setLeaveGuildModalOpen(false);
  };

  const copyShareLink = () => {
    if(settings.shareLink) {
        navigator.clipboard.writeText(settings.shareLink)
            .then(() => {
                setCopyStatus('Copied!');
                setTimeout(() => setCopyStatus('Copy'), 2000);
            })
            .catch(err => console.error('Failed to copy text: ', err));
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Details Card */}
      <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-brand-dark flex items-center justify-center border-4 border-brand-orange">
                    {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User size={64} className="text-brand-text-secondary" />
                    )}
                </div>
                <label htmlFor="profilePicInput" className="absolute bottom-0 right-0 bg-brand-orange p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors">
                    <Camera size={16} className="text-white" />
                    <input id="profilePicInput" type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                </label>
            </div>
            <div className="space-y-4 w-full text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h2 className="text-3xl font-bold text-white">{user?.username}</h2>
                    {userIsVip && (
                        <div className="flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold" title="VIP Member">
                            <Crown size={16}/> VIP Member
                        </div>
                    )}
                </div>
                {userIsVip && user?.vipExpiry && (
                    <p className="text-xs text-center sm:text-left text-yellow-400">
                        Expires on: {new Date(user.vipExpiry).toLocaleDateString()}
                    </p>
                )}
                <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                     <input value={user?.email || ''} readOnly className="w-full bg-brand-dark border border-gray-700 text-brand-text-secondary rounded-md px-3 py-2 pl-10 cursor-not-allowed" />
                </div>
                 <Input label="UPI ID (for withdrawals)" id="upiId" name="upiId" value={formData.upiId} onChange={handleFormChange} placeholder="yourname@upi" />
            </div>
        </div>
      </div>
      
      {/* In-Game Details Card */}
      <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
        <h2 className="text-xl font-bold text-brand-orange mb-4 flex items-center gap-2"><Gamepad2/> In-Game Details</h2>
        <p className="text-xs text-brand-text-secondary mb-4">Provide your Free Fire account details for verification. Changing these will require re-verification.</p>
        <div className="space-y-4">
             <div className="flex items-center gap-2 p-3 bg-brand-dark rounded-md">
                {user?.isUidVerified ? <ShieldCheck className="text-green-400"/> : <ShieldAlert className="text-yellow-400"/>}
                <span className="text-sm">Verification Status: <span className={user?.isUidVerified ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{user?.isUidVerified ? 'Verified' : 'Pending Verification'}</span></span>
             </div>
            <Input label="Free Fire UID" id="ffUid" name="freefireUid" value={formData.freefireUid} onChange={handleFormChange} placeholder="e.g., 1234567890"/>
            <Input label="In-Game Name (IGN)" id="ign" name="inGameName" value={formData.inGameName} onChange={handleFormChange} placeholder="e.g., YourGamerTag"/>
            <Input label="In-Game Level" type="number" id="level" name="inGameLevel" value={formData.inGameLevel} onChange={handleFormChange} placeholder="e.g., 50"/>
        </div>
      </div>

       {/* Guild Card */}
      <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
        <h2 className="text-xl font-bold text-brand-orange mb-4 flex items-center gap-2"><User/> My Guild</h2>
        {user?.guildId ? (
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-brand-text-secondary">You are a member of</p>
                    <p className="text-lg font-bold text-white">{user.guildName}</p>
                </div>
                <Button onClick={() => setLeaveGuildModalOpen(true)} variant="danger" className="flex items-center gap-2">
                    <LogOut size={16} /> Leave Guild
                </Button>
            </div>
        ) : (
             <div className="text-center">
                <p className="text-brand-text-secondary">You are not currently in a guild.</p>
                <Link to="/guilds">
                    <Button variant="secondary" className="mt-4">Explore Guilds</Button>
                </Link>
             </div>
        )}
      </div>

       {/* Share App Card */}
      <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
        <h2 className="text-xl font-bold text-brand-orange mb-4 flex items-center gap-2"><Share2/> Share App</h2>
        <p className="text-brand-text-secondary text-sm mb-4">Share this link with your friends to invite them to the platform!</p>
        <div className="flex items-center gap-2">
            <Input value={settings.shareLink || ''} readOnly className="bg-brand-dark"/>
            <Button onClick={copyShareLink} variant="secondary" className={`flex items-center gap-2 ${copyStatus === 'Copied!' ? '!bg-green-600' : ''}`}>
                {copyStatus === 'Copied!' ? <Check size={16}/> : <Copy size={16}/>}
                {copyStatus}
            </Button>
        </div>
      </div>

       {/* Security Card */}
      <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
        <h2 className="text-xl font-bold text-brand-orange mb-4 flex items-center gap-2"><KeyRound/> Security</h2>
        <div className="space-y-4">
            <Input label="Current Password" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} />
            <Input label="New Password" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} />
            <Input label="Confirm New Password" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} />
            <Button onClick={handleChangePassword} variant="secondary" className="w-full">Update Password</Button>
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full" disabled={!isChanged}>Save Changes</Button>
      
      <ConfirmationModal
        isOpen={isLeaveGuildModalOpen}
        onClose={() => setLeaveGuildModalOpen(false)}
        onConfirm={handleLeaveGuild}
        title="Leave Guild"
        message={<p>Are you sure you want to leave <strong>{user?.guildName}</strong>? If you are the last member, the guild will be disbanded.</p>}
        confirmButtonText="Yes, Leave"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ProfilePage;
