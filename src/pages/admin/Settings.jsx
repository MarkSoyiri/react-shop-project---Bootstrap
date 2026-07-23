import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';

function AdminSettings() {
  const { get, put, loading } = useApi();
  const { addToast, Toast } = useToast();
  const [settings, setSettings] = useState({});
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await get('/settings');
      setSettings(res.data || {});
    } catch (err) { console.error(err); }
  };

  const updateSetting = async (key, value) => {
    try {
      await put('/settings', { key, value });
      addToast('Setting updated', 'success');
      loadSettings();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const tabs = [
    { key: 'general', label: 'General', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { key: 'delivery', label: 'Delivery', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { key: 'payment', label: 'Payment', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { key: 'notification', label: 'Notifications', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
    { key: 'business', label: 'Business', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  ];

  const renderInput = (setting) => {
    const val = setting.value;
    const isBool = typeof val === 'boolean';

    if (isBool) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => updateSetting(setting.key, !val)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none',
              background: val ? '#e85d04' : '#d1d5db',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
              padding: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 3, left: val ? 23 : 3,
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
          <span style={{ fontSize: 13, color: val ? '#111827' : '#9ca3af', fontWeight: 500 }}>{val ? 'Enabled' : 'Disabled'}</span>
        </div>
      );
    }

    if (typeof val === 'number') {
      return (
        <input
          type="number"
          step="0.01"
          defaultValue={val}
          onBlur={(e) => updateSetting(setting.key, parseFloat(e.target.value))}
          style={{ padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, width: 120, outline: 'none', background: '#fafafa' }}
        />
      );
    }

    return (
      <input
        type="text"
        defaultValue={val}
        onBlur={(e) => updateSetting(setting.key, e.target.value)}
        style={{ padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, width: '100%', maxWidth: 400, outline: 'none', background: '#fafafa' }}
      />
    );
  };

  return (
    <div>
      <Toast />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Settings</h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Configure your store settings</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '12px 16px', border: 'none',
                  background: activeTab === tab.key ? 'rgba(232,93,4,0.08)' : 'transparent',
                  color: activeTab === tab.key ? '#e85d04' : '#6b7280',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', borderBottom: '1px solid #f3f4f6',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{tabs.find(t => t.key === activeTab)?.label} Settings</h3>
          </div>
          <div style={{ padding: '8px 24px' }}>
            {settings[activeTab]?.map(setting => (
              <div key={setting.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid #f9fafb',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{setting.description || setting.key}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{setting.key}</div>
                </div>
                <div style={{ flexShrink: 0, marginLeft: 16 }}>
                  {renderInput(setting)}
                </div>
              </div>
            ))}
            {(!settings[activeTab] || settings[activeTab].length === 0) && (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: 48 }}>No settings for this category</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
