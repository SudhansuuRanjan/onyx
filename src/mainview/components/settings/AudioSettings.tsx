import { AudioSettings as Settings, AudioAction, AudioFormat } from "../../../shared/types";

interface AudioSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
}

export function AudioSettings({ settings, onChange }: AudioSettingsProps) {
    return (
        <>
            <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Action</label>
                <div className="flex flex-col gap-2.5">
                    {([
                        { value: "extract", name: "Extract", desc: "Save audio separately" },
                        { value: "strip", name: "Strip", desc: "Remove audio" },
                        { value: "mute", name: "Mute", desc: "Zero volume" },
                    ] as const).map((a) => (
                        <button
                            key={a.value}
                            className={`w-full border rounded-lg py-3.5 px-3 cursor-pointer transition-all duration-200 text-center text-t-primary ${settings.action === a.value
                                ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                                : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                                }`}
                            onClick={() => onChange({ ...settings, action: a.value as AudioAction })}
                        >
                            <span className="block font-semibold text-sm mb-0.5">{a.name}</span>
                            <span className={`block text-[11px] ${settings.action === a.value ? "text-accent-hover" : "text-t-muted"}`}>{a.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {settings.action === "extract" && (
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Output Format</label>
                    <div className="flex flex-col gap-2">
                        {(["mp3", "aac", "wav"] as const).map((f) => (
                            <button
                                key={f}
                                className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${settings.outputFormat === f
                                    ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                                    : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                                    }`}
                                onClick={() => onChange({ ...settings, outputFormat: f as AudioFormat })}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
