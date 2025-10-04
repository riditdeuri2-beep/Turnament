

import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Megaphone, RefreshCw } from 'lucide-react';

const UpdatesPage: React.FC = () => {
    const { adminUpdates } = useData();
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleRefresh = () => {
        setIsLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Megaphone className="text-brand-orange" />
                        App Updates
                    </h1>
                    <p className="text-brand-text-secondary mt-1">Stay informed with the latest news and announcements.</p>
                </div>
                <button 
                    onClick={handleRefresh} 
                    className={`p-2 rounded-full transition-colors ${isLoading ? 'text-brand-orange animate-spin' : 'text-brand-text-secondary hover:bg-brand-gray hover:text-brand-orange'}`}
                    aria-label="Refresh updates"
                    disabled={isLoading}
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-brand-gray p-4 rounded-lg border border-brand-light-gray animate-pulse">
                            <div className="h-6 bg-brand-light-gray rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-brand-light-gray rounded w-full mb-2"></div>
                            <div className="h-4 bg-brand-light-gray rounded w-5/6"></div>
                            <div className="h-40 bg-brand-light-gray rounded w-full mt-4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {adminUpdates.length > 0 ? (
                        adminUpdates.map((update, index) => (
                            <div 
                                key={update.id} 
                                className="bg-brand-gray p-5 rounded-lg border border-brand-light-gray transition-shadow hover:shadow-lg hover:border-brand-orange/50 animate-fade-in-up opacity-0"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-brand-orange pr-4">{update.title}</h3>
                                    <span className="text-xs text-brand-text-secondary whitespace-nowrap">{new Date(update.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-brand-text-secondary mt-2 text-sm">{update.content}</p>
                                {update.imagePath && (
                                    <div className="mt-4">
                                        <img 
                                            src={update.imagePath} 
                                            alt={update.title} 
                                            className="rounded-lg w-full max-h-80 object-cover border border-brand-light-gray" 
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-brand-gray p-8 text-center rounded-lg border border-brand-light-gray">
                            <Megaphone size={48} className="mx-auto text-brand-text-secondary mb-4" />
                            <h3 className="text-xl font-semibold text-white">No Updates Yet</h3>
                            <p className="text-brand-text-secondary mt-2">Check back later for news and announcements from the admin team.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UpdatesPage;