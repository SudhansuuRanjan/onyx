import { TrimSettings as Settings } from "../../../shared/types";
import { formatDuration } from "../../utils";

interface TrimSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
    duration: number;
}

export function TrimSettings({ settings, onChange, duration }: TrimSettingsProps) {
    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        onChange({ ...settings, startTime: Math.max(0, Math.min(val, settings.endTime)) });
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        onChange({ ...settings, endTime: Math.max(settings.startTime, Math.min(val, duration)) });
    };

    return (
        <div className="flex flex-col gap-5">
            <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Start Time (sec)</label>
                <input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={settings.startTime}
                    onChange={handleStartChange}
                    className="w-full bg-white/[0.04] border border-default rounded-lg py-2.5 px-3 text-sm text-t-primary focus:border-accent focus:outline-none transition-colors"
                />
                <div className="text-[11px] text-t-muted mt-1 text-right">{formatDuration(settings.startTime)}</div>
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">End Time (sec)</label>
                <input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={settings.endTime}
                    onChange={handleEndChange}
                    className="w-full bg-white/[0.04] border border-default rounded-lg py-2.5 px-3 text-sm text-t-primary focus:border-accent focus:outline-none transition-colors"
                />
                <div className="text-[11px] text-t-muted mt-1 text-right">{formatDuration(settings.endTime)}</div>
            </div>
            <div className="text-center text-xs text-t-secondary bg-white/[0.02] py-2 rounded-lg border border-white/[0.04]">
                Duration: <span className="font-semibold text-t-primary">{formatDuration(settings.endTime - settings.startTime)}</span>
            </div>
        </div>
    );
}
