import React from 'react';
import Avatar from 'react-avatar';

const Admin = ({ username }) => {
    return (
        <div className="admin">
            <span>Admin:</span><Avatar name={username} size={50} round="14px" />
            <span className="userName">{username}</span>
        </div>
    );
};

export default Admin;