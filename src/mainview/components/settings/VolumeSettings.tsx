import { VolumeSettings as Settings } from "../../../shared/types";

interface VolumeSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
}

export function VolumeSettings({ settings, onChange }: VolumeSettingsProps) {
    const percentage = Math.round(settings.volume * 100);

    return (
        <div>
            <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-semibold uppercase tracking-[0.06em] text-t-muted">Volume Booster</label>
                <span className="text-sm font-bold text-accent">{percentage}%</span>
            </div>
            <div className="relative h-6 flex items-center">
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) => onChange({ volume: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-accent"
                />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-t-muted font-medium">
                <span>Mute</span>
                <span>100%</span>
                <span>200%</span>
            </div>
        </div>
    );
}
