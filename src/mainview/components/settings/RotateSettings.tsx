import { RotateSettings as Settings } from "../../../shared/types";

interface RotateSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
}

export function RotateSettings({ settings, onChange }: RotateSettingsProps) {
    return (
        <>
            <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Angle</label>
                <div className="flex gap-2">
                    {([0, 90, 180, 270] as const).map((angle) => (
                        <button
                            key={angle}
                            className={`flex-1 border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${settings.angle === angle
                                ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                                : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                                }`}
                            onClick={() => onChange({ ...settings, angle })}
                        >
                            {angle}°
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Flip</label>
                <div className="flex gap-2">
                    {(["none", "horizontal", "vertical"] as const).map((flip) => (
                        <button
                            key={flip}
                            className={`flex-1 border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${settings.flip === flip
                                ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                                : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                                }`}
                            onClick={() => onChange({ ...settings, flip })}
                        >
                            {flip === "none" ? "None" : flip === "horizontal" ? "↔ H" : "↕ V"}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
