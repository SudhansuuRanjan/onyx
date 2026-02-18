import { SpeedSettings as Settings } from "../../../shared/types";

interface SpeedSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
}

export function SpeedSettings({ settings, onChange }: SpeedSettingsProps) {
    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Playback Speed</label>
            <div className="grid grid-cols-3 gap-2">
                {([0.5, 1, 1.5, 2, 4] as const).map((s) => (
                    <button
                        key={s}
                        className={`border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${settings.speed === s
                            ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                            : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                            }`}
                        onClick={() => onChange({ speed: s })}
                    >
                        {s}x
                    </button>
                ))}
            </div>
        </div>
    );
}
