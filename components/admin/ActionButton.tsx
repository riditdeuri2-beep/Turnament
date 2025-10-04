import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ActionButtonProps {
    to: string;
    title: string;
    icon: React.ElementType;
}

const ActionButton: React.FC<ActionButtonProps> = ({ to, title, icon: Icon }) => {
    return (
        <Link to={to} className="bg-brand-dark p-4 rounded-lg border border-brand-light-gray flex items-center gap-4 hover:bg-brand-light-gray hover:border-brand-orange/50 transition-all transform hover:scale-105">
            <Icon className="text-brand-orange" size={24} />
            <span className="font-semibold text-white">{title}</span>
            <ArrowRight className="ml-auto text-brand-text-secondary" size={20}/>
        </Link>
    );
}

export default ActionButton;
