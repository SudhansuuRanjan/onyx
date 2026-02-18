import { ConvertSettings as Settings } from "../../../shared/types";

interface ConvertSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
}

export function ConvertSettings({ settings, onChange }: ConvertSettingsProps) {
    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Target Format</label>
            <div className="flex flex-col gap-2">
                {(["mp4", "mkv", "avi", "webm", "mov"] as const).map((f) => (
                    <button
                        key={f}
                        className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${settings.format === f
                            ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                            : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                            }`}
                        onClick={() => onChange({ format: f })}
                    >
                        {f.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
}
