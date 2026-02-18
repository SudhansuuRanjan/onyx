import { ScreenshotSettings as Settings } from "../../../shared/types";
import { formatDuration } from "../../utils";

interface ScreenshotSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
    duration: number;
}

export function ScreenshotSettings({ settings, onChange, duration }: ScreenshotSettingsProps) {
    const handleChange = (val: number) => {
        onChange({ timestamp: Math.max(0, Math.min(val, duration)) });
    };

    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Capture Time (sec)</label>
            <div className="flex flex-col gap-2">
                <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={settings.timestamp}
                    onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
                    className="w-full accent-accent h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer"
                />
                <input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={settings.timestamp}
                    onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/[0.04] border border-default rounded-lg py-2.5 px-3 text-sm text-t-primary focus:border-accent focus:outline-none transition-colors"
                />
            </div>
            <div className="text-[11px] text-t-muted mt-1 text-right">{formatDuration(settings.timestamp)} / {formatDuration(duration)}</div>
        </div>
    );
}
