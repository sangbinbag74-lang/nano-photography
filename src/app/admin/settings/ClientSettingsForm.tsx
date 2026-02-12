
"use client";

import { useState } from "react";
import { saveSettings } from "../actions_settings";
import { auth } from "@/lib/firebase";
import { Save, Loader2 } from "lucide-react";

export default function ClientSettingsForm({ initialSettings }: { initialSettings: any }) {
    const [settings, setSettings] = useState(initialSettings);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const result = await saveSettings(settings, auth.currentUser?.email || "unknown");

        if (result.success) {
            alert("Settings saved!");
        } else {
            alert("Failed to save settings");
        }
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-xl border border-white/10 bg-white/5">

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-white">Maintenance Mode</h3>
                    <p className="text-sm text-white/50">Disable new image generations globally.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            {/* Announcement */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Announcement Banner</label>
                <input
                    type="text"
                    value={settings.announcement || ""}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                    placeholder="Enter message to display on home page..."
                />
            </div>

            {/* AI Model */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">AI Model Name</label>
                <select
                    value={settings.modelName || "gemini-1.5-flash"}
                    onChange={(e) => setSettings({ ...settings, modelName: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-pro">Gemini Pro</option>
                </select>
                <p className="text-xs text-white/40">Requires backend support for dynamic model switching.</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}
