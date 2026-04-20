import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import StudentDashboard from '../components/StudentDashboard';
import RecruiterDashboard from '../components/RecruiterDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <div>Loading...</div>;

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'student':
            return <StudentDashboard />;
        case 'recruiter':
            return <RecruiterDashboard />;
        default:
            return <div>Invalid role</div>;
    }
};

export default Dashboard;
