import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { motion } from "framer-motion";
import { PageHeader } from "./components/PageHeader";
import { SkeletonStatCards } from "./components/Skeletons";

const TABS = [
  { key: "general", label: "General" },
  { key: "delivery", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "notifications", label: "Notifications" },
  { key: "business", label: "Business" },
];

function detectType(value) {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  return "string";
}

function renderInput(setting, type, localValue, onChange, saving) {
  if (type === "boolean") {
    return (
      <div className="admin-toggle-wrapper">
        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={!!localValue}
            onChange={() => onChange(!localValue)}
          />
          <span className="admin-toggle-slider"></span>
        </label>
      </div>
    );
  }
  if (type === "number") {
    return (
      <input
        className="admin-input"
        type="number"
        value={localValue ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={saving}
      />
    );
  }
  return (
    <input
      className="admin-input"
      type="text"
      value={localValue ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={saving}
    />
  );
}

function SettingRow({ setting, onSaved }) {
  const [localValue, setLocalValue] = useState(setting.value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { put } = useApi();
  const type = detectType(setting.value);

  useEffect(() => {
    setLocalValue(setting.value);
    setSaved(false);
  }, [setting.value]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await put("/settings", { key: setting.key, value: localValue });
      setSaved(true);
      if (onSaved) onSaved();
      setTimeout(() => setSaved(false), 1500);
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-setting-row">
      <div className="admin-setting-info">
        <div className="admin-setting-label">{setting.label || setting.key}</div>
        {setting.description && (
          <div className="admin-setting-desc">{setting.description}</div>
        )}
      </div>
      <div className="admin-setting-control">
        {renderInput(setting, type, localValue, setLocalValue, saving)}
        {type !== "boolean" && (
          <button
            className="admin-btn admin-btn-sm admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
        {type === "boolean" && (
          <button
            className="admin-btn admin-btn-sm admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
        {saved && <span className="admin-setting-saved">Saved</span>}
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const { get, loading } = useApi();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await get("/settings");
        setData(result.data || result);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [get]);

  const settings = data || {};
  const currentSettings = settings[activeTab] || [];

  return (
    <motion.div
      className="admin-settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader title="Settings" subtitle="Manage your store settings" />

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-settings-content">
        {loading ? (
          <SkeletonStatCards count={4} />
        ) : currentSettings.length === 0 ? (
          <div className="admin-empty-state">
            <p>No settings for this category</p>
          </div>
        ) : (
          <div className="admin-settings-list">
            {currentSettings.map((setting) => (
              <SettingRow key={setting.key} setting={setting} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
