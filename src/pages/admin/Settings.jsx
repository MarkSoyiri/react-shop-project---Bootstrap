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
    { key: 'general', label: 'General', icon: '🏪' },
    { key: 'delivery', label: 'Delivery', icon: '🚗' },
    { key: 'payment', label: 'Payment', icon: '💳' },
    { key: 'notification', label: 'Notifications', icon: '🔔' },
    { key: 'business', label: 'Business', icon: '📊' },
  ];

  const renderInput = (setting) => {
    const val = setting.value;
    const isBool = typeof val === 'boolean';

    if (isBool) {
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div
            onClick={() => updateSetting(setting.key, !val)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: val ? 'var(--color-brand)' : 'var(--color-border)',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 2, left: val ? 22 : 2,
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          <span style={{ fontSize: 14 }}>{val ? 'Enabled' : 'Disabled'}</span>
        </label>
      );
    }

    if (typeof val === 'number') {
      return (
        <input
          type="number"
          step="0.01"
          defaultValue={val}
          onBlur={(e) => updateSetting(setting.key, parseFloat(e.target.value))}
          style={{
            padding: '8px 12px', border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', fontSize: 14, width: 120,
          }}
        />
      );
    }

    return (
      <input
        type="text"
        defaultValue={val}
        onBlur={(e) => updateSetting(setting.key, e.target.value)}
        style={{
          padding: '8px 12px', border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)', fontSize: 14, width: '100%', maxWidth: 400,
        }}
      />
    );
  };

  return (
    <div>
      <Toast />
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Settings</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Configure your store settings</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 200, flexShrink: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '12px 16px', border: 'none',
                borderRadius: 'var(--radius-sm)', background: activeTab === tab.key ? 'rgba(232,93,4,0.08)' : 'transparent',
                color: activeTab === tab.key ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s', marginBottom: 4,
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-card" style={{ flex: 1 }}>
          <div className="admin-card-header">
            <h3>{tabs.find(t => t.key === activeTab)?.label} Settings</h3>
          </div>
          <div className="admin-card-body">
            {settings[activeTab]?.map(setting => (
              <div key={setting.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid var(--color-border-light)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{setting.description || setting.key}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{setting.key}</div>
                </div>
                {renderInput(setting)}
              </div>
            ))}
            {(!settings[activeTab] || settings[activeTab].length === 0) && (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 40 }}>
                No settings for this category
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
