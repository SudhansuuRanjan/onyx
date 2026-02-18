import { GifSettings as Settings } from "../../../shared/types";

interface GifSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
}

export function GifSettings({ settings, onChange }: GifSettingsProps) {
    return (
        <>
            <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Frame Rate</label>
                <div className="flex flex-col gap-2">
                    {([10, 15, 24] as const).map((f) => (
                        <button
                            key={f}
                            className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${settings.fps === f
                                ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                                : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                                }`}
                            onClick={() => onChange({ ...settings, fps: f })}
                        >
                            {f} FPS
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Width</label>
                <div className="flex flex-col gap-2">
                    {([
                        { value: 0, label: "Original" },
                        { value: 640, label: "640px" },
                        { value: 480, label: "480px" },
                        { value: 320, label: "320px" },
                    ] as const).map((w) => (
                        <button
                            key={w.value}
                            className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${settings.width === w.value
                                ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                                : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                                }`}
                            onClick={() => onChange({ ...settings, width: w.value as Settings["width"] })}
                        >
                            {w.label}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
