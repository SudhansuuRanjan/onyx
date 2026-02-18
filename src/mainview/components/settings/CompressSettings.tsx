import { CompressionSettings } from "../../../shared/types";

interface CompressSettingsProps {
    settings: CompressionSettings;
    onChange: (s: CompressionSettings) => void;
}

export function CompressSettings({ settings, onChange }: CompressSettingsProps) {
    return (
        <>
            <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Quality</label>
                <div className="flex flex-col gap-2.5">
                    {(["high", "medium", "low"] as const).map((q) => (
                        <button
                            key={q}
                            className={`w-full border rounded-lg py-3.5 px-3 cursor-pointer transition-all duration-200 text-center text-t-primary ${settings.quality === q
                                ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                                : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                                }`}
                            onClick={() => onChange({ ...settings, quality: q })}
                        >
                            <span className="block font-semibold text-sm mb-0.5">{q.charAt(0).toUpperCase() + q.slice(1)}</span>
                            <span className={`block text-[11px] ${settings.quality === q ? "text-accent-hover" : "text-t-muted"}`}>
                                {q === "high" && "Best quality"}
                                {q === "medium" && "Balanced"}
                                {q === "low" && "Smallest"}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Resolution</label>
                <div className="flex flex-col gap-2">
                    {([
                        { value: "original", label: "Original" },
                        { value: "1080p", label: "1080p" },
                        { value: "720p", label: "720p" },
                        { value: "480p", label: "480p" },
                    ] as const).map((r) => (
                        <button
                            key={r.value}
                            className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${settings.resolution === r.value
                                ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                                : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                                }`}
                            onClick={() => onChange({ ...settings, resolution: r.value })}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
