import React, { useState, useEffect, useMemo } from 'react';
import { useData, isVipActive } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { Gift, MessageSquare, PlusCircle, Edit, Search, User as UserIcon, Eye, DollarSign, Gamepad2, ShieldCheck, ShieldAlert, Crown, ShieldOff, EyeOff } from 'lucide-react';

const ManageUsersPage: React.FC = () => {
  const { users, addBonusBalance, vipChats, createVipChat, updateUserByAdmin, updateUserBanStatus } = useData();
  const { user: adminUser, startImpersonation } = useAuth();
  const navigate = useNavigate();
  
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isVipChatModalOpen, setIsVipChatModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false);
  
  const [newVipChatTitle, setNewVipChatTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bonusAmount, setBonusAmount] = useState('');
  const [editFormState, setEditFormState] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Ban/Unban actions
  const [banningUser, setBanningUser] = useState<User | null>(null);
  const [userToUnban, setUserToUnban] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  
  const filteredUsers = useMemo(() => {
    return users.filter(u => u.role === 'user' && u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [users, searchQuery]);

  useEffect(() => {
    if (selectedUser) {
        setEditFormState(selectedUser);
    }
  }, [selectedUser]);

  const handleOpenBonusModal = (user: User) => {
    setSelectedUser(user);
    setBonusAmount('');
    setIsBonusModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };
  
  const handleOpenViewProfileModal = (user: User) => {
    setSelectedUser(user);
    setIsViewProfileModalOpen(true);
  };
  
  const handleCloseModals = () => {
      setIsBonusModalOpen(false);
      setIsVipChatModalOpen(false);
      setIsEditUserModalOpen(false);
      setIsViewProfileModalOpen(false);
      setBanningUser(null);
      setUserToUnban(null);
      setSelectedUser(null);
      setEditFormState(null);
      setBanReason('');
  };

  const handleAddBonus = () => {
    if (selectedUser && adminUser && bonusAmount) {
      const amount = Number(bonusAmount);
      if (amount > 0) {
        addBonusBalance(selectedUser.id, amount, adminUser.username);
        handleCloseModals();
      }
    }
  };

  const handleCreateVipChat = () => {
    if (newVipChatTitle.trim() && adminUser) {
        createVipChat(newVipChatTitle.trim(), adminUser.id);
        setNewVipChatTitle('');
        handleCloseModals();
    }
  };
  
  const handleEditUserSubmit = () => {
    if (editFormState && adminUser) {
        const result = updateUserByAdmin(adminUser.username, editFormState);
        if (result) {
            handleCloseModals();
        }
    }
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (editFormState) {
          const numericFields = ['winnableBalance', 'depositedBalance', 'bonusBalance', 'inGameLevel'];
          if (numericFields.includes(name)) {
              setEditFormState({ ...editFormState, [name]: Number(value) });
          } else if (name === 'dailyBetLimitOverride') {
              setEditFormState({ ...editFormState, [name]: value === '' ? undefined : Number(value) });
          } else {
              setEditFormState({ ...editFormState, [name]: value });
          }
      }
  };

  const handleImpersonate = (user: User) => {
      startImpersonation(user);
      navigate('/dashboard');
  };
  
  const handleBanUser = () => {
    if (banningUser && banReason && adminUser) {
        updateUserBanStatus(banningUser.id, true, adminUser.username, banReason);
        handleCloseModals();
    }
  };

  const handleConfirmUnban = () => {
    if (userToUnban && adminUser) {
        updateUserBanStatus(userToUnban.id, false, adminUser.username);
        handleCloseModals();
    }
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-orange">Manage Users</h1>
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input 
            placeholder="Search by username..."
            className="pl-12 !py-3"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-brand-gray rounded-lg shadow-lg overflow-hidden border border-brand-light-gray">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-light-gray">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Total Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Device Info</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const totalBalance = user.winnableBalance + user.depositedBalance + user.bonusBalance;
                return (
                    <tr key={user.id} className="border-b border-brand-light-gray last:border-b-0">
                      <td className="p-4 font-semibold">{user.username}</td>
                      <td className="p-4">₹{totalBalance.toFixed(2)}</td>
                      <td className="p-4">
                         <span className={`font-semibold ${user.isBanned ? 'text-red-400' : 'text-green-400'}`}>
                            {user.isBanned ? 'Banned' : 'Active'}
                         </span>
                      </td>
                      <td className="p-4 text-sm truncate max-w-xs">{user.lastDeviceInfo || 'N/A'}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-1 flex-wrap">
                            <Button onClick={() => handleImpersonate(user)} variant="secondary" className="!py-1 !px-2 text-xs flex items-center gap-1"><EyeOff size={14} /> Impersonate</Button>
                            <Button onClick={() => handleOpenViewProfileModal(user)} variant="secondary" className="!py-1 !px-2 text-xs flex items-center gap-1"><Eye size={14} /> View</Button>
                            <Button onClick={() => handleOpenEditModal(user)} variant="secondary" className="!py-1 !px-2 text-xs flex items-center gap-1"><Edit size={14} /> Edit</Button>
                            <Button onClick={() => handleOpenBonusModal(user)} variant="secondary" className="!py-1 !px-2 text-xs flex items-center gap-1"><Gift size={14} /> Bonus</Button>
                             {user.isBanned ? (
                                <Button onClick={() => setUserToUnban(user)} variant="primary" className="!py-1 !px-2 text-xs flex items-center gap-1"><ShieldCheck size={14}/> Unban</Button>
                            ) : (
                                <Button onClick={() => setBanningUser(user)} variant="danger" className="!py-1 !px-2 text-xs flex items-center gap-1"><ShieldOff size={14}/> Ban</Button>
                            )}
                        </div>
                      </td>
                    </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

       <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">VIP Chat Rooms</h2>
                <Button onClick={() => setIsVipChatModalOpen(true)} variant="secondary" className="flex items-center gap-2">
                    <PlusCircle size={18} /> Create New Chat
                </Button>
            </div>
            <div className="space-y-2">
                {vipChats.map(chat => (
                    <div key={chat.id} className="bg-brand-dark p-3 rounded-md flex items-center gap-3">
                        <MessageSquare className="text-brand-orange" />
                        <span className="font-semibold">{chat.title}</span>
                    </div>
                ))}
            </div>
        </div>

       <Modal isOpen={isBonusModalOpen} onClose={handleCloseModals} title={`Add Bonus to ${selectedUser?.username}`}>
          <div className="space-y-4">
            <Input 
              label="Bonus Amount (₹)"
              type="number"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(e.target.value)}
              placeholder="e.g., 100"
            />
            <Button onClick={handleAddBonus} className="w-full">Confirm & Add Bonus</Button>
          </div>
        </Modal>

        <Modal isOpen={isVipChatModalOpen} onClose={handleCloseModals} title="Create New VIP Chat Room">
            <div className="space-y-4">
                <p className="text-sm text-brand-text-secondary">This chat room will be visible to all VIP members.</p>
                <Input
                    label="Chat Room Title"
                    value={newVipChatTitle}
                    onChange={(e) => setNewVipChatTitle(e.target.value)}
                    placeholder="e.g., VIP Tournament Announcements"
                />
                <Button onClick={handleCreateVipChat} className="w-full">Create Chat</Button>
            </div>
        </Modal>
        
        <Modal isOpen={isViewProfileModalOpen} onClose={handleCloseModals} title={`Profile: ${selectedUser?.username}`} size="lg">
            {selectedUser && (
            <div className="space-y-4 text-sm">
                <div className="p-4 bg-brand-dark rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-xs text-green-400">Winnable</p>
                        <p className="font-bold text-xl">₹{selectedUser.winnableBalance.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-blue-400">Deposited</p>
                        <p className="font-bold text-xl">₹{selectedUser.depositedBalance.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-yellow-400">Bonus</p>
                        <p className="font-bold text-xl">₹{selectedUser.bonusBalance.toFixed(2)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-brand-dark rounded-lg space-y-2">
                         <h4 className="font-semibold text-brand-orange flex items-center gap-2"><Gamepad2 size={16}/> In-Game Details</h4>
                         <p><strong>UID:</strong> {selectedUser.freefireUid || 'N/A'}</p>
                         <p><strong>IGN:</strong> {selectedUser.inGameName || 'N/A'}</p>
                         <p><strong>Level:</strong> {selectedUser.inGameLevel || 'N/A'}</p>
                         <div className="flex items-center gap-2">
                            {selectedUser.isUidVerified ? <ShieldCheck className="text-green-400"/> : <ShieldAlert className="text-yellow-400"/>}
                            <span>Status: <span className={selectedUser.isUidVerified ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{selectedUser.isUidVerified ? 'Verified' : 'Pending'}</span></span>
                         </div>
                    </div>
                    <div className="p-3 bg-brand-dark rounded-lg space-y-2">
                        <h4 className="font-semibold text-brand-orange flex items-center gap-2"><UserIcon size={16}/> Account Details</h4>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>UPI ID:</strong> {selectedUser.upiId || 'N/A'}</p>
                        <p><strong>Guild:</strong> {selectedUser.guildName || 'None'}</p>
                        <div className="flex items-center gap-2">
                             {isVipActive(selectedUser.vipExpiry) ? <Crown className="text-yellow-400"/> : <Crown className="text-gray-600"/>}
                             <span>VIP Status: <span className={isVipActive(selectedUser.vipExpiry) ? 'text-yellow-400 font-bold' : 'text-gray-500 font-bold'}>
                                {isVipActive(selectedUser.vipExpiry) ? `Active (Expires: ${new Date(selectedUser.vipExpiry!).toLocaleDateString()})` : 'Inactive'}
                             </span></span>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </Modal>

        <Modal isOpen={isEditUserModalOpen} onClose={handleCloseModals} title={`Edit ${selectedUser?.username}`} size="lg">
            {editFormState && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <h3 className="font-semibold text-brand-orange">User Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Username" name="username" value={editFormState.username} onChange={handleEditFormChange} />
                    <Input label="Email" name="email" value={editFormState.email} onChange={handleEditFormChange} />
                </div>
                <h3 className="font-semibold text-brand-orange pt-2">Balances</h3>
                <div className="grid grid-cols-3 gap-4">
                    <Input label="Winnable (₹)" name="winnableBalance" type="number" value={editFormState.winnableBalance} onChange={handleEditFormChange} />
                    <Input label="Deposited (₹)" name="depositedBalance" type="number" value={editFormState.depositedBalance} onChange={handleEditFormChange} />
                    <Input label="Bonus (₹)" name="bonusBalance" type="number" value={editFormState.bonusBalance} onChange={handleEditFormChange} />
                </div>
                 <h3 className="font-semibold text-brand-orange pt-2">In-Game Details</h3>
                 <div className="grid grid-cols-3 gap-4">
                     <Input label="Free Fire UID" name="freefireUid" value={editFormState.freefireUid || ''} onChange={handleEditFormChange} />
                     <Input label="In-Game Name" name="inGameName" value={editFormState.inGameName || ''} onChange={handleEditFormChange} />
                     <Input label="In-Game Level" name="inGameLevel" type="number" value={editFormState.inGameLevel || ''} onChange={handleEditFormChange} />
                 </div>
                 <h3 className="font-semibold text-brand-orange pt-2">Other Details</h3>
                 <Input label="UPI ID" name="upiId" value={editFormState.upiId || ''} onChange={handleEditFormChange} />
                 <Input label="VIP Expiry Date (ISO Format)" name="vipExpiry" placeholder="YYYY-MM-DDTHH:mm:ss.sssZ" value={editFormState.vipExpiry || ''} onChange={handleEditFormChange} />
                 <Input label="Daily Bet Limit Override (₹)" name="dailyBetLimitOverride" type="number" placeholder="Leave empty for global limit" value={editFormState.dailyBetLimitOverride ?? ''} onChange={handleEditFormChange} />


                 <Button onClick={handleEditUserSubmit} className="w-full mt-4">Save Changes</Button>
            </div>
            )}
        </Modal>

        <Modal isOpen={!!banningUser} onClose={handleCloseModals} title={`Ban ${banningUser?.username}`}>
            <div className="space-y-4">
                <Input label="Reason for Ban" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="e.g., Use of third-party cheats"/>
                <Button onClick={handleBanUser} variant="danger" className="w-full">Confirm Ban</Button>
            </div>
        </Modal>

        <ConfirmationModal
            isOpen={!!userToUnban}
            onClose={handleCloseModals}
            onConfirm={handleConfirmUnban}
            title="Unban User"
            message={<p>Are you sure you want to unban <strong>{userToUnban?.username}</strong>? They will regain full access to the app.</p>}
            confirmButtonText="Yes, Unban"
        />
    </div>
  );
};

export default ManageUsersPage;