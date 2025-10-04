import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Wallet, ArrowDownCircle, ArrowUpCircle, AlertTriangle, CheckCircle, Clock, Copy, TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';

type TransactionFilter = 'all' | 'deposit' | 'withdraw';

const WalletPage: React.FC = () => {
    const { user } = useAuth();
    const { settings, deposits, withdrawals, addDepositRequest, addWithdrawalRequest } = useData();
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('history');
    
    // Deposit State
    const [depositAmount, setDepositAmount] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [depositStatus, setDepositStatus] = useState<'form' | 'confirm'>('form');
    const [depositError, setDepositError] = useState('');

    // Withdraw State
    const [withdrawAmount, setWithdrawAmount] = useState('');
    
    // History State
    const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('all');


    const totalBalance = user ? user.winnableBalance + user.depositedBalance + user.bonusBalance : 0;
    const winnablePercent = totalBalance > 0 && user ? (user.winnableBalance / totalBalance) * 100 : 0;
    const bonusPercent = totalBalance > 0 && user ? (user.bonusBalance / totalBalance) * 100 : 0;
    const depositedPercent = 100 - winnablePercent - bonusPercent;

    const userTransactions = useMemo(() => {
        if (!user) return [];
        const userDeposits = deposits.filter(d => d.userId === user.id).map(d => ({ ...d, type: 'deposit' as const }));
        const userWithdrawals = withdrawals.filter(w => w.userId === user.id).map(w => ({ ...w, type: 'withdraw' as const }));
        
        const all = [...userDeposits, ...userWithdrawals].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (transactionFilter === 'deposit') return all.filter(tx => tx.type === 'deposit');
        if (transactionFilter === 'withdraw') return all.filter(tx => tx.type === 'withdraw');
        return all;
    }, [deposits, withdrawals, user, transactionFilter]);


    const handleDepositSubmit = () => {
        if (!user) return;
        setDepositError(''); // Clear previous errors
        const amount = Number(depositAmount);
        if (!amount || !transactionId) {
          setDepositError("Please fill all fields.");
          return;
        }
        if(amount < 10) {
            setDepositError("Minimum deposit amount is ₹10.");
            return;
        }
        if(!/^\d{1,12}$/.test(transactionId)) {
            setDepositError("Transaction ID must be a numeric value with up to 12 digits.");
            return;
        }
        addDepositRequest({
            userId: user.id,
            username: user.username,
            amount,
            transactionId,
        });
        setDepositStatus('confirm');
    };
    
    const handleNewDeposit = () => {
        setDepositAmount('');
        setTransactionId('');
        setDepositStatus('form');
        setDepositError('');
    }

    const handleWithdrawSubmit = () => {
        if (!user) return;
        if (!user.upiId) {
            addWithdrawalRequest({ userId: user.id, username: user.username, amount: 0, upiId: '' }); // Will trigger error notification
            return;
        }
        const amount = Number(withdrawAmount);
        const success = addWithdrawalRequest({
            userId: user.id,
            username: user.username,
            amount,
            upiId: user.upiId,
        });
        
        if (success) {
            setWithdrawAmount('');
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // The notification is now handled globally, so no need for an alert
    };
    
    const renderStatusChip = (status: 'Pending' | 'Completed' | 'Rejected') => {
        const styles = {
            Pending: 'bg-yellow-500/20 text-yellow-400',
            Completed: 'bg-green-500/20 text-green-400',
            Rejected: 'bg-red-500/20 text-red-400',
        };
        return <span className={`px-2 py-1 text-xs rounded-full font-semibold ${styles[status]}`}>{status}</span>;
    };


    return (
    <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-brand-gray p-6 md:p-8 rounded-lg shadow-lg text-center border border-brand-light-gray relative overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative z-10">
                <p className="text-brand-text-secondary">Total Balance</p>
                <h2 className="text-5xl font-bold text-white my-2">
                    ₹<AnimatedCounter value={totalBalance} />
                </h2>
                
                <div className="mt-6 space-y-2">
                    <div className="w-full bg-brand-dark rounded-full h-2.5 flex overflow-hidden">
                       <div 
                           className="bg-green-500 h-2.5 transition-width duration-700 ease-out" 
                           style={{ width: `${winnablePercent}%` }}>
                       </div>
                        <div 
                           className="bg-yellow-500 h-2.5 transition-width duration-700 ease-out" 
                           style={{ width: `${bonusPercent}%` }}>
                       </div>
                       <div 
                           className="bg-blue-500 h-2.5 transition-width duration-700 ease-out" 
                           style={{ width: `${depositedPercent}%` }}>
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm pt-2">
                        <div>
                            <p className="flex items-center justify-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500"></span><span className="text-green-400">Withdrawable</span></p>
                            <p className="font-semibold text-lg">₹{user?.winnableBalance.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="flex items-center justify-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-500"></span><span className="text-yellow-400">Bonus</span></p>
                            <p className="font-semibold text-lg">₹{user?.bonusBalance.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="flex items-center justify-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span><span className="text-blue-400">Deposited</span></p>
                            <p className="font-semibold text-lg">₹{user?.depositedBalance.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-brand-gray rounded-lg shadow-lg border border-brand-light-gray">
            <div className="flex border-b border-brand-light-gray">
                <button onClick={() => setActiveTab('deposit')} className={`flex-1 p-4 font-semibold transition-colors ${activeTab === 'deposit' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-brand-text-secondary hover:text-white'}`}>Deposit</button>
                <button onClick={() => setActiveTab('withdraw')} className={`flex-1 p-4 font-semibold transition-colors ${activeTab === 'withdraw' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-brand-text-secondary hover:text-white'}`}>Withdraw</button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 p-4 font-semibold transition-colors ${activeTab === 'history' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-brand-text-secondary hover:text-white'}`}>History</button>
            </div>
            
            <div className="p-6">
                {activeTab === 'deposit' && (
                    depositStatus === 'form' ? (
                        <div className="text-center">
                            {settings.upiId && settings.qrCodePath ? (
                                <>
                                    <p className="text-brand-text-secondary mb-4">Scan the QR code or use the UPI ID to pay. Minimum deposit is ₹10.</p>
                                    <img src={settings.qrCodePath} alt="UPI QR Code" className="w-48 h-48 mx-auto rounded-lg border-4 border-brand-orange" />
                                    <div className="mt-4 flex justify-center items-center gap-2 p-2 bg-brand-dark rounded-md">
                                        <p className="font-semibold text-white">UPI: <span className="font-mono text-brand-orange">{settings.upiId}</span></p>
                                        <button onClick={() => copyToClipboard(settings.upiId)} className="text-brand-text-secondary hover:text-white"><Copy size={16}/></button>
                                    </div>
                                    <div className="space-y-4 mt-6 text-left">
                                        <Input label="Amount Paid (₹)" type="number" placeholder="10" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                                        <Input label="UPI Transaction ID (up to 12 digits)" type="tel" pattern="\d{1,12}" maxLength={12} placeholder="Enter your transaction ID" value={transactionId} onChange={e => setTransactionId(e.target.value.replace(/\D/g, ''))}/>
                                    </div>
                                    {depositError && (
                                        <div className="mt-4 p-3 rounded-md text-sm flex items-center justify-center gap-2 bg-red-500/20 text-red-400">
                                            <AlertTriangle size={18} />
                                            <span>{depositError}</span>
                                        </div>
                                    )}
                                    <Button onClick={handleDepositSubmit} className="w-full mt-6 gap-2"><ArrowDownCircle size={20}/> Submit for Verification</Button>
                                </>
                            ) : (
                                <p className="text-brand-red">Admin UPI details not set. Please try again later.</p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center space-y-4 py-8">
                            <CheckCircle size={64} className="text-green-400 mx-auto animate-pulse"/>
                            <h3 className="text-2xl font-bold text-white">Deposit Request Submitted!</h3>
                            <p className="text-brand-text-secondary">Your deposit of <span className="font-bold text-white">₹{depositAmount}</span> is now pending verification. It will be added to your account upon admin approval.</p>
                            <Button onClick={handleNewDeposit} variant="secondary">Make Another Deposit</Button>
                        </div>
                    )
                )}

                {activeTab === 'withdraw' && (
                    <div className="space-y-4">
                        <p className="text-brand-text-secondary">Your registered UPI ID for withdrawals is:</p>
                        <p className="p-3 bg-brand-dark rounded-md text-brand-orange font-mono text-center">{user?.upiId || 'Not set. Please add it in your profile.'}</p>
                        <div className="text-center p-2 bg-brand-dark rounded-md">
                            Withdrawable Balance: <span className="font-bold text-green-400">₹{user?.winnableBalance.toFixed(2)}</span>
                        </div>
                        
                        <Input label="Amount to Withdraw (₹)" type="number" placeholder="Enter amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                        <p className="text-xs text-brand-text-secondary text-center -mt-2">Minimum withdrawal is ₹30.</p>
                        <Button onClick={handleWithdrawSubmit} className="w-full mt-4 gap-2" disabled={!user?.upiId}><ArrowUpCircle size={20}/>Request Withdrawal</Button>
                    </div>
                )}
                
                {activeTab === 'history' && (
                    <div>
                        <div className="flex items-center gap-2 rounded-lg bg-brand-dark p-1 border border-brand-light-gray w-fit mb-4">
                            <Button onClick={() => setTransactionFilter('all')} variant={transactionFilter === 'all' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-sm !shadow-none !hover:-translate-y-0">All</Button>
                            <Button onClick={() => setTransactionFilter('deposit')} variant={transactionFilter === 'deposit' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-sm !shadow-none !hover:-translate-y-0">Deposits</Button>
                            <Button onClick={() => setTransactionFilter('withdraw')} variant={transactionFilter === 'withdraw' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-sm !shadow-none !hover:-translate-y-0">Withdrawals</Button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {userTransactions.length > 0 ? userTransactions.map((tx, index) => (
                                <div 
                                    key={`${tx.type}-${tx.id}`} 
                                    className="p-3 bg-brand-dark rounded-md animate-fade-in-up opacity-0"
                                    style={{ animationDelay: `${index * 75}ms` }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                {tx.type === 'deposit' ? <TrendingUp size={20} className="text-green-400"/> : <TrendingDown size={20} className="text-red-400"/>}
                                            </div>
                                            <div>
                                                <p className="font-semibold capitalize">{tx.type} {tx.status === 'Completed' && 'Successful'}</p>
                                                <p className="text-xs text-brand-text-secondary">{new Date(tx.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                            </p>
                                            {renderStatusChip(tx.status)}
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-brand-light-gray text-xs text-brand-text-secondary font-mono">
                                        {tx.type === 'deposit' && `Txn ID: ${(tx as any).transactionId}`}
                                        {tx.type === 'withdraw' && `To UPI: ${(tx as any).upiId}`}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-brand-text-secondary py-8">No transactions yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        <div className="bg-yellow-900/50 border border-yellow-400/30 p-4 rounded-lg text-sm flex items-center gap-3">
            <AlertTriangle className="text-yellow-400 h-8 w-8 flex-shrink-0" />
            <p className="text-yellow-200">
                Bonus balance will be used first for tournament entry fees. Only funds won from tournaments ('Withdrawable Balance') can be withdrawn.
            </p>
        </div>
    </div>
  );
};

export default WalletPage;