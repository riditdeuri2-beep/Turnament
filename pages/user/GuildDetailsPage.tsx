import React, { useState, useRef, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, User, Users, Trophy, BarChart, ArrowLeft, Send } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const GuildDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { guilds, users, getGuildMessages, sendGuildMessage } = useData();
    const { user } = useAuth();
    
    const [guildMessage, setGuildMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const guildId = parseInt(id || '0', 10);
    const guild = guilds.find(g => g.id === guildId);
    
    const guildMessages = guild ? getGuildMessages(guild.id) : [];

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [guildMessages]);


    if (!guild || !user) {
        return <Navigate to="/guilds" />;
    }

    const leader = users.find(u => u.id === guild.leaderId);
    const members = users.filter(u => guild.memberIds.includes(u.id));

    const handleSendGuildMessage = () => {
        if (!user || !guildMessage.trim()) return;
        sendGuildMessage(user.id, guild.id, guildMessage);
        setGuildMessage('');
    };

    const DetailsTab = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-brand-dark p-4 rounded-lg">
                <Users size={24} className="mx-auto text-brand-text-secondary mb-2" />
                <p className="text-2xl font-bold">{guild.memberIds.length}</p>
                <p className="text-sm text-brand-text-secondary">Members</p>
            </div>
            <div className="bg-brand-dark p-4 rounded-lg">
                <Trophy size={24} className="mx-auto text-green-400 mb-2" />
                <p className="text-2xl font-bold text-green-400">{guild.wins}</p>
                <p className="text-sm text-brand-text-secondary">Total Wins</p>
            </div>
            <div className="bg-brand-dark p-4 rounded-lg">
                <BarChart size={24} className="mx-auto text-red-400 mb-2" />
                <p className="text-2xl font-bold text-red-400">{guild.losses}</p>
                <p className="text-sm text-brand-text-secondary">Total Losses</p>
            </div>
        </div>
    );

    const MembersTab = (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {members.map(member => (
                <div key={member.id} className="bg-brand-dark p-4 rounded-lg text-center">
                    <User size={32} className="mx-auto text-brand-text-secondary mb-2"/>
                    <p className="font-semibold text-white truncate">{member.username}</p>
                    {member.id === guild.leaderId && (
                        <p className="text-xs text-yellow-400 font-bold">Leader</p>
                    )}
                </div>
            ))}
        </div>
    );

    const GuildChatTab = (
        <div className="flex flex-col h-[60vh] max-h-[500px]">
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-brand-dark rounded-t-lg">
                {guildMessages.map(msg => {
                    const sender = users.find(u => u.id === msg.senderId);
                    const isCurrentUser = msg.senderId === user.id;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            {!isCurrentUser && <p className="text-xs text-brand-text-secondary ml-2 mb-1">{sender?.username || 'Unknown'}</p>}
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-brand-orange text-white' : 'bg-brand-light-gray'}`}>
                                <p>{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-4 bg-brand-light-gray border-t border-brand-dark rounded-b-lg">
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Type a message to the guild..."
                        value={guildMessage}
                        onChange={e => setGuildMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendGuildMessage()}
                    />
                    <Button onClick={handleSendGuildMessage}><Send size={18}/></Button>
                </div>
            </div>
        </div>
    );

    const tabs = [{ label: 'Stats', content: DetailsTab }, { label: 'Members', content: MembersTab }];
    if (user.guildId === guild.id) {
        tabs.splice(1, 0, { label: 'Guild Chat', content: GuildChatTab });
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to="/guilds" className="inline-flex items-center gap-2 text-brand-text-secondary hover:text-brand-orange transition-colors">
                <ArrowLeft size={18} /> Back to Guilds List
            </Link>

            <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-brand-dark rounded-full border-4 border-brand-orange">
                        <Shield size={64} className="text-brand-orange" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold text-white">{guild.name}</h1>
                        <p className="text-brand-text-secondary mt-1">Leader: <span className="font-semibold text-brand-orange">{leader?.username || 'Unknown'}</span></p>
                    </div>
                </div>
            </div>

            <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
                <Tabs tabs={tabs} />
            </div>
        </div>
    );
};

export default GuildDetailsPage;