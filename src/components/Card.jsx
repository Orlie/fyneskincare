// src/components/Card.jsx

import React from 'react';

// Helper function that the Card component needs
const cx = (...c) => c.filter(Boolean).join(" ");

function Card({ className, children, onClick, title }) {
    return (
        <div
            onClick={onClick}
            title={title}
            className={cx(
                "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg transition-all duration-300",
                onClick && "cursor-pointer hover:bg-white/10 hover:border-white/20",
                className
            )}
        >
            {children}
        </div>
    );
}

export default Card;