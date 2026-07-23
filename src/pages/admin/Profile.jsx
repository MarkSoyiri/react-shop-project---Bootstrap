import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { AuthContext } from '../../context/AuthContext';
import { PageHeader } from './components/PageHeader';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { get, post, put, loading } = useApi();

  const [profile, setProfile] = useState(null);
  const [personalForm, setPersonalForm] = useState({ username: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [personalSaving, setPersonalSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [personalSaved, setPersonalSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await get('/auth/profile');
        const profileData = data.data || data.user || data;
        setProfile(profileData);
        setPersonalForm({
          username: profileData.username || user?.username || '',
          email: profileData.email || user?.email || '',
          phone: profileData.phone || '',
        });
      } catch (error) {
        if (user) {
          setProfile(user);
          setPersonalForm({
            username: user.username || '',
            email: user.email || '',
            phone: '',
          });
        }
      }
    };
    fetchProfile();
  }, [user, get]);

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setPersonalSaving(true);
    setPersonalSaved(false);
    try {
      const response = await put('/auth/profile', { username: personalForm.username, phone: personalForm.phone });
      setProfile(response.data || response.user || response);
      setPersonalSaved(true);
      setTimeout(() => setPersonalSaved(false), 2500);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setPersonalSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordSaving(true);
    setPasswordSaved(false);
    try {
      await post('/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordSaved(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (error) {
      setPasswordError('Failed to change password. Please check your current password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const activities = [
    { id: 1, icon: 'bi-box-seam', text: 'Added new product "Wireless Headphones"', timestamp: '2 minutes ago', color: 'success' },
    { id: 2, icon: 'bi-pencil-square', text: 'Updated order #1042 status to "Shipped"', timestamp: '15 minutes ago', color: 'primary' },
    { id: 3, icon: 'bi-person-plus', text: 'Registered new customer account', timestamp: '1 hour ago', color: 'info' },
    { id: 4, icon: 'bi-trash', text: 'Removed discontinued product listing', timestamp: '3 hours ago', color: 'danger' },
    { id: 5, icon: 'bi-gear', text: 'Updated store shipping settings', timestamp: '5 hours ago', color: 'secondary' },
    { id: 6, icon: 'bi-receipt', text: 'Processed refund for order #1038', timestamp: 'Yesterday at 4:32 PM', color: 'warning' },
    { id: 7, icon: 'bi-graph-up', text: 'Generated monthly sales report', timestamp: 'Yesterday at 11:00 AM', color: 'primary' },
    { id: 8, icon: 'bi-shield-lock', text: 'Changed admin account password', timestamp: '2 days ago', color: 'info' },
  ];

  const getInitials = () => {
    const name = profile?.username || user?.username || 'A';
    return name.charAt(0).toUpperCase();
  };

  const getRoleBadgeClass = () => {
    const role = profile?.role || user?.role || 'admin';
    const map = {
      superadmin: 'bg-danger',
      admin: 'bg-primary',
      manager: 'bg-warning text-dark',
      staff: 'bg-secondary',
    };
    return map[role] || 'bg-primary';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="admin-profile-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <PageHeader
        title="My Profile"
        breadcrumb={['Dashboard', 'Profile']}
      />

      <div className="admin-profile-content">
        <div className="row g-4">
          <div className="col-lg-4">
            <motion.div className="admin-card admin-profile-card" variants={itemVariants}>
              <div className="admin-card-body text-center">
                <div className="admin-avatar-circle">
                  <span className="admin-avatar-initials">{getInitials()}</span>
                </div>
                <h3 className="admin-profile-username mt-3">{profile?.username || user?.username || 'Admin User'}</h3>
                <p className="admin-profile-email text-muted mb-2">
                  {profile?.email || user?.email || 'admin@example.com'}
                </p>
                <span className={`badge ${getRoleBadgeClass()} admin-role-badge`}>
                  {(profile?.role || user?.role || 'admin').toUpperCase()}
                </span>

                <div className="admin-profile-stats mt-4">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="admin-profile-stat-value">128</div>
                      <div className="admin-profile-stat-label text-muted">Orders</div>
                    </div>
                    <div className="col-4">
                      <div className="admin-profile-stat-value">45</div>
                      <div className="admin-profile-stat-label text-muted">Products</div>
                    </div>
                    <div className="col-4">
                      <div className="admin-profile-stat-value">7</div>
                      <div className="admin-profile-stat-label text-muted">Years</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="admin-card admin-activity-card mt-4" variants={itemVariants}>
              <div className="admin-card-header">
                <h5 className="admin-card-title">
                  <i className="bi bi-clock-history me-2"></i>
                  Recent Activity
                </h5>
              </div>
              <div className="admin-card-body">
                <div className="admin-activity-list">
                  {activities.map((activity) => (
                    <div key={activity.id} className="admin-activity-item">
                      <div className={`admin-activity-icon bg-${activity.color} bg-opacity-10`}>
                        <i className={`bi ${activity.icon} text-${activity.color}`}></i>
                      </div>
                      <div className="admin-activity-details">
                        <p className="admin-activity-text mb-0">{activity.text}</p>
                        <small className="admin-activity-time text-muted">{activity.timestamp}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-lg-8">
            <motion.div className="admin-card admin-form-card" variants={itemVariants}>
              <div className="admin-card-header">
                <h5 className="admin-card-title">
                  <i className="bi bi-person me-2"></i>
                  Personal Information
                </h5>
              </div>
              <div className="admin-card-body">
                <form onSubmit={handlePersonalSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="admin-form-label">Username</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={personalForm.username}
                        onChange={(e) => setPersonalForm({ ...personalForm, username: e.target.value })}
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="admin-form-label">Email Address</label>
                      <input
                        type="email"
                        className="admin-form-input"
                        value={personalForm.email}
                        disabled
                        placeholder="Email cannot be changed"
                      />
                      <div className="admin-form-text text-muted mt-1">
                        <i className="bi bi-info-circle me-1"></i>
                        Contact support to change your email.
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="admin-form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="admin-form-input"
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div className="admin-form-actions mt-4">
                    <motion.button
                      type="submit"
                      className="admin-btn admin-btn-primary"
                      disabled={personalSaving}
                      whileTap={{ scale: 0.97 }}
                    >
                      {personalSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : personalSaved ? (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Saved!
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Save Changes
                        </>
                      )}
                    </motion.button>
                    {personalSaved && (
                      <motion.span
                        className="admin-save-success ms-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <i className="bi bi-check-circle-fill text-success me-1"></i>
                        Changes saved successfully
                      </motion.span>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>

            <motion.div className="admin-card admin-form-card mt-4" variants={itemVariants}>
              <div className="admin-card-header">
                <h5 className="admin-card-title">
                  <i className="bi bi-shield-lock me-2"></i>
                  Change Password
                </h5>
              </div>
              <div className="admin-card-body">
                <form onSubmit={handlePasswordSubmit}>
                  {passwordError && (
                    <motion.div
                      className="admin-alert admin-alert-danger mb-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {passwordError}
                    </motion.div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="admin-form-label">Current Password</label>
                      <input
                        type="password"
                        className="admin-form-input"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="admin-form-label">New Password</label>
                      <input
                        type="password"
                        className="admin-form-input"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="admin-form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="admin-form-input"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>
                  <div className="admin-form-actions mt-4">
                    <motion.button
                      type="submit"
                      className="admin-btn admin-btn-primary"
                      disabled={passwordSaving}
                      whileTap={{ scale: 0.97 }}
                    >
                      {passwordSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating...
                        </>
                      ) : passwordSaved ? (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Updated!
                        </>
                      ) : (
                        <>
                          <i className="bi bi-key me-2"></i>
                          Update Password
                        </>
                      )}
                    </motion.button>
                    {passwordSaved && (
                      <motion.span
                        className="admin-save-success ms-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <i className="bi bi-check-circle-fill text-success me-1"></i>
                        Password updated successfully
                      </motion.span>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
