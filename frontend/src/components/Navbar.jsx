import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

const Navbar = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const onLogoutClick = async () => {
        await handleLogout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1.2rem 3rem',
            backgroundColor: '#0f172a', /* Tailwind Slate 900 */
            borderBottom: '1px solid #1e293b', /* Tailwind Slate 800 */
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{
                color: '#e2e8f0', /* Tailwind Slate 200 */
                fontWeight: '500',
                fontSize: '0.95rem',
                letterSpacing: '0.025em'
            }}>
                Hi, <span style={{ color: '#f8fafc', fontWeight: '600' }}>{user.username}</span>
            </div>
            
            <button 
                onClick={onLogoutClick}
                style={{
                    backgroundColor: '#ef4444', /* Tailwind Red 500 */
                    color: '#ffffff',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1)',
                    transition: 'all 0.2s ease-in-out'
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#dc2626'; /* Tailwind Red 600 */
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 8px -1px rgba(239, 68, 68, 0.3), 0 4px 6px -1px rgba(239, 68, 68, 0.2)';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#ef4444';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1)';
                }}
                onMouseDown={(e) => {
                    e.target.style.transform = 'translateY(1px)';
                    e.target.style.boxShadow = '0 1px 2px 0 rgba(239, 68, 68, 0.2)';
                }}
                onMouseUp={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 8px -1px rgba(239, 68, 68, 0.3), 0 4px 6px -1px rgba(239, 68, 68, 0.2)';
                }}
            >
                Logout
            </button>
        </header>
    );
};

export default Navbar;
