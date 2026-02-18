import { CropSettings as Settings } from "../../../shared/types";

interface CropSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
    videoWidth: number;
    videoHeight: number;
}

export function CropSettings({ settings, onChange, videoWidth, videoHeight }: CropSettingsProps) {
    const handleDimChange = (key: keyof Settings, value: string) => {
        const val = parseInt(value) || 0;
        const newSettings = { ...settings, [key]: val };
        // Ensure bounds
        if (newSettings.x + newSettings.width > videoWidth) newSettings.width = videoWidth - newSettings.x;
        if (newSettings.y + newSettings.height > videoHeight) newSettings.height = videoHeight - newSettings.y;
        onChange(newSettings);
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Width</label>
                    <input
                        type="number"
                        min={1}
                        max={videoWidth}
                        value={settings.width}
                        onChange={(e) => handleDimChange("width", e.target.value)}
                        className="w-full bg-white/[0.04] border border-default rounded-lg py-2.5 px-3 text-sm text-t-primary focus:border-accent focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Height</label>
                    <input
                        type="number"
                        min={1}
                        max={videoHeight}
                        value={settings.height}
                        onChange={(e) => handleDimChange("height", e.target.value)}
                        className="w-full bg-white/[0.04] border border-default rounded-lg py-2.5 px-3 text-sm text-t-primary focus:border-accent focus:outline-none transition-colors"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">X Offset</label>
                    <input
                        type="number"
                        min={0}
                        max={videoWidth - settings.width}
                        value={settings.x}
                        onChange={(e) => handleDimChange("x", e.target.value)}
                        className="w-full bg-white/[0.04] border border-default rounded-lg py-2.5 px-3 text-sm text-t-primary focus:border-accent focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Y Offset</label>
                    <input
                        type="number"
                        min={0}
                        max={videoHeight - settings.height}
                        value={settings.y}
                        onChange={(e) => handleDimChange("y", e.target.value)}
                        className="w-full bg-white/[0.04] border border-default rounded-lg py-2.5 px-3 text-sm text-t-primary focus:border-accent focus:outline-none transition-colors"
                    />
                </div>
            </div>
            <div className="text-[11px] text-t-muted mt-3 text-center">
                Original: {videoWidth}x{videoHeight}
            </div>
        </>
    );
}
