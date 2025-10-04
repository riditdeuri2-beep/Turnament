import React, { useState, useRef, useEffect, ChangeEvent, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData, isVipActive, VIP_PLANS } from '../../contexts/DataContext';
import { Search, Send, Coins, Crown, Check, Paperclip, X, MessageSquare, Calendar, Star } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import type { User, VipChat } from '../../types';

type Conversation = {
    id: number;
    name: string;
    type: 'user' | 'vip_chat';
    data: User | VipChat;
};

const ChatPage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { users, getMessages, sendMessage, sendCoins, buyVip, vipChats, getVipChatMessages, sendVipChatMessage } = useData();
    
    const [selectedConversation, setSelectedConversation] = useState<{ id: number; type: 'user' | 'vip_chat' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageContent, setMessageContent] = useState('');
    
    const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
    const [isVipModalOpen, setIsVipModalOpen] = useState(false);
    const [coinAmount, setCoinAmount] = useState('');
    
    const [imageToSend, setImageToSend] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    
    const userIsVip = isVipActive(user?.vipExpiry);

    const conversationList = useMemo(() => {
        const adminUser = users.find(u => u.role === 'superadmin');
        const otherUsers = users.filter(u => u.id !== user?.id && u.role === 'user');

        let allConversations: Conversation[] = otherUsers.map(u => ({ id: u.id, name: u.username, type: 'user', data: u }));

        if (adminUser) {
            allConversations.unshift({ id: adminUser.id, name: adminUser.username, type: 'user', data: adminUser });
        }
        
        if (userIsVip) {
            const vipChatConversations: Conversation[] = vipChats.map(vc => ({ id: vc.id, name: vc.title, type: 'vip_chat', data: vc }));
            allConversations.unshift(...vipChatConversations);
        }

        return allConversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    }, [users, vipChats, user, userIsVip, searchQuery]);
    
    const selectedConversationData = useMemo(() => {
        if (!selectedConversation) return null;
        if (selectedConversation.type === 'user') {
            return users.find(u => u.id === selectedConversation.id);
        } else {
            return vipChats.find(vc => vc.id === selectedConversation.id);
        }
    }, [selectedConversation, users, vipChats]);

    const messages = useMemo(() => {
        if (!user || !selectedConversation) return [];
        if (selectedConversation.type === 'user') {
            return getMessages(user.id, selectedConversation.id);
        } else {
            return getVipChatMessages(selectedConversation.id);
        }
    }, [user, selectedConversation, getMessages, getVipChatMessages]);


    const isChattingWithAdmin = selectedConversation?.type === 'user' && (selectedConversationData as User)?.role === 'superadmin';
    const canChatWithAdmin = userIsVip || !isChattingWithAdmin;
    const canSendPhotos = userIsVip && isChattingWithAdmin;

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!user || !selectedConversation) return;
        if (!messageContent.trim() && !imageToSend) return;

        if (selectedConversation.type === 'user') {
             const imagePath = imageToSend ? URL.createObjectURL(imageToSend) : undefined;
             sendMessage(user.id, selectedConversation.id, messageContent, imagePath);
        } else {
            // No images in VIP chats for now for simplicity
            sendVipChatMessage(selectedConversation.id, user.id, messageContent);
        }
        
        setMessageContent('');
        setImageToSend(null);
        setImagePreview(null);
    };

    const handleSendCoins = () => {
        if (!user || !selectedConversation || selectedConversation.type !== 'user' || !coinAmount) return;
        const amount = Number(coinAmount);
        const success = sendCoins(user.id, selectedConversation.id, amount);
        if (success) {
            setIsCoinModalOpen(false);
            setCoinAmount('');
        }
    };

    const handleBuyVip = (plan: 'month' | 'year') => {
        if (!user) return;
        const success = buyVip(user.id, plan);
        if (success) {
            setIsVipModalOpen(false);
        }
    };
    
    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageToSend(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const clearImage = () => {
        setImageToSend(null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    }

    return (
        <div className="flex h-[calc(100vh-150px)] md:h-[calc(100vh-120px)] bg-brand-gray rounded-lg border border-brand-light-gray overflow-hidden">
            {/* User List Sidebar */}
            <div className="w-1/3 border-r border-brand-light-gray flex flex-col">
                <div className="p-4 border-b border-brand-light-gray">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input 
                            type="text" 
                            placeholder="Search chats..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <ul>
                        {conversationList.map(c => {
                            const isUserType = c.type === 'user';
                            const convUser = c.data as User;
                            const isAdmin = isUserType && convUser.role === 'superadmin';
                            const isVipUser = isUserType && isVipActive(convUser.vipExpiry);

                            return (
                                <li key={`${c.type}-${c.id}`}>
                                    <button 
                                        onClick={() => setSelectedConversation({ id: c.id, type: c.type })}
                                        className={`w-full text-left p-4 hover:bg-brand-light-gray transition-colors flex items-center gap-3 ${selectedConversation?.id === c.id && selectedConversation?.type === c.type ? 'bg-brand-orange/20' : ''}`}
                                    >
                                        <div className="w-6 flex-shrink-0 flex items-center justify-center">
                                            {c.type === 'vip_chat' && <MessageSquare className="text-brand-orange"/>}
                                            {isAdmin && <Crown size={20} className="text-yellow-400"/>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <p className="font-semibold">{c.name}</p>
                                                {isVipUser && !isAdmin && <Crown size={14} className="text-yellow-500" title="VIP Member" />}
                                            </div>
                                            <p className="text-xs text-brand-text-secondary">
                                                {c.type === 'vip_chat' ? 'VIP Room' : isAdmin ? 'Administrator' : convUser.status}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Chat Window */}
            <div className="w-2/3 flex flex-col">
                {selectedConversationData ? (
                    <>
                        <div className="p-4 border-b border-brand-light-gray flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-orange flex items-center gap-2">
                               {selectedConversation?.type === 'user' && (selectedConversationData as User)?.role === 'superadmin' && <Crown size={20} className="text-yellow-400"/>}
                               {selectedConversation?.type === 'vip_chat' && <MessageSquare size={20} className="text-brand-orange"/>}
                               {(selectedConversationData as any).username || (selectedConversationData as any).title}
                            </h2>
                            {selectedConversation?.type === 'user' && (selectedConversationData as User).role !== 'superadmin' && (
                                <Button onClick={() => setIsCoinModalOpen(true)} variant="secondary" className="!py-1 !px-2 flex items-center gap-1.5 text-sm">
                                    <Coins size={14} /> Send Coins
                                </Button>
                            )}
                        </div>
                        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-brand-dark/30">
                            {messages.map(msg => {
                                const isUserMessage = 'receiverId' in msg;
                                const sender = users.find(u => u.id === msg.senderId);
                                const isCurrentUser = msg.senderId === user?.id;
                                
                                return (
                                <div key={msg.id} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                    {!isCurrentUser && !isUserMessage && (
                                        <p className="text-xs text-brand-text-secondary ml-2 mb-1">{sender?.username || 'Unknown'}</p>
                                    )}
                                    <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-brand-orange text-white' : 'bg-brand-light-gray'}`}>
                                        {isUserMessage && msg.imagePath && <img src={msg.imagePath} alt="Sent attachment" className="rounded-md mb-2 max-w-full h-auto cursor-pointer" onClick={() => setViewingImage(msg.imagePath!)}/>}
                                        {isUserMessage && msg.isCoinTransfer ? (
                                            <p className="text-sm italic flex items-center gap-2"><Coins size={14}/> {isCurrentUser ? 'You' : sender?.username} {msg.content}</p>
                                        ) : (
                                            msg.content && <p>{msg.content}</p>
                                        )}
                                        <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                        <div className="p-4 bg-brand-gray border-t border-brand-light-gray relative">
                            {imagePreview && (
                                <div className="relative mb-2 p-2 bg-brand-dark rounded-md w-fit">
                                    <img src={imagePreview} alt="Preview" className="max-h-24 rounded"/>
                                    <button onClick={clearImage} className="absolute -top-2 -right-2 bg-brand-red p-1 rounded-full text-white hover:bg-red-700">
                                        <X size={14}/>
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={handleImageSelect} />
                                {canSendPhotos && (
                                    <Button variant="secondary" onClick={() => imageInputRef.current?.click()}><Paperclip size={18}/></Button>
                                )}
                                <Input 
                                    placeholder={canChatWithAdmin ? "Type a message..." : "Become a VIP to chat with Admins"}
                                    value={messageContent}
                                    onChange={e => setMessageContent(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    disabled={!canChatWithAdmin}
                                />
                                <Button onClick={handleSendMessage} disabled={!canChatWithAdmin || (!messageContent.trim() && !imageToSend)}><Send size={18}/></Button>
                            </div>
                            {!canChatWithAdmin && (
                                <div className="absolute inset-0 bg-brand-gray/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-4 rounded-b-lg">
                                    <p className="text-center font-semibold">Only VIP members can chat with Admins.</p>
                                    <Button onClick={() => setIsVipModalOpen(true)} className="flex items-center gap-2">
                                        <Crown size={18}/> Become a VIP
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-brand-text-secondary">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
            
            <Modal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} title={`Send Coins to ${(selectedConversationData as User)?.username}`}>
                <div className="space-y-4">
                    <Input label="Amount" type="number" placeholder="Enter amount" value={coinAmount} onChange={e => setCoinAmount(e.target.value)} />
                    <Button onClick={handleSendCoins} className="w-full">Confirm & Send</Button>
                </div>
            </Modal>
            
            <Modal isOpen={!!viewingImage} onClose={() => setViewingImage(null)} title="Image Preview" size="lg">
                {viewingImage && <img src={viewingImage} alt="Full view" className="w-full h-auto rounded-lg object-contain max-h-[80vh]"/>}
            </Modal>

            <Modal isOpen={isVipModalOpen} onClose={() => setIsVipModalOpen(false)} title="Become a VIP Member">
                <div className="space-y-6 text-center">
                    <Crown size={48} className="mx-auto text-yellow-400"/>
                    <p className="text-lg text-brand-text-secondary">Unlock exclusive features by becoming a VIP member.</p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-brand-dark p-4 rounded-lg border border-brand-light-gray text-center">
                            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><Calendar size={20}/> 1 Month</h3>
                            <p className="text-3xl font-bold my-2 text-brand-orange">{VIP_PLANS.month.price} <span className="text-lg">Coins</span></p>
                            <Button onClick={() => handleBuyVip('month')} className="w-full">Purchase</Button>
                        </div>
                        <div className="flex-1 bg-brand-dark p-4 rounded-lg border-2 border-brand-orange text-center relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange px-3 py-0.5 rounded-full text-xs font-bold">BEST VALUE</div>
                            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><Star size={20}/> 1 Year</h3>
                            <p className="text-3xl font-bold my-2 text-brand-orange">{VIP_PLANS.year.price} <span className="text-lg">Coins</span></p>
                            <Button onClick={() => handleBuyVip('year')} className="w-full">Purchase</Button>
                        </div>
                    </div>
                     <ul className="text-left space-y-2 p-4 bg-brand-dark rounded-md text-sm">
                        <li className="flex items-center gap-2"><Check className="text-green-400"/> Create your own guild</li>
                        <li className="flex items-center gap-2"><Check className="text-green-400"/> Chat directly with Admins</li>
                        <li className="flex items-center gap-2"><Check className="text-green-400"/> Send photos to support</li>
                        <li className="flex items-center gap-2"><Check className="text-green-400"/> Exclusive VIP chat rooms</li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default ChatPage;
