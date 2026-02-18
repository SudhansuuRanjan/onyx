import { AspectRatioSettings as Settings } from "../../../shared/types";

interface AspectRatioSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
}

export function AspectRatioSettings({ settings, onChange }: AspectRatioSettingsProps) {
    const ratios: Settings["ratio"][] = ["9:16", "1:1", "4:5", "16:9", "21:9"];
    const backgrounds: Settings["background"][] = ["blur", "black", "white"];

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Target Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                    {ratios.map((r) => (
                        <button
                            key={r}
                            onClick={() => onChange({ ...settings, ratio: r })}
                            className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${settings.ratio === r
                                    ? "bg-accent/10 border-accent text-accent shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                                    : "bg-white/[0.03] border-white/[0.08] text-t-secondary hover:bg-white/[0.08]"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Background Style</label>
                <div className="grid grid-cols-3 gap-2">
                    {backgrounds.map((bg) => (
                        <button
                            key={bg}
                            onClick={() => onChange({ ...settings, background: bg })}
                            className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all capitalize ${settings.background === bg
                                    ? "bg-accent/10 border-accent text-accent shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                                    : "bg-white/[0.03] border-white/[0.08] text-t-secondary hover:bg-white/[0.08]"
                                }`}
                        >
                            {bg}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
