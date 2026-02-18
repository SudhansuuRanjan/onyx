import { WatermarkSettings as Settings } from "../../../shared/types";

interface WatermarkSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
    onSelectImage: () => void;
}

export function WatermarkSettings({ settings, onChange, onSelectImage }: WatermarkSettingsProps) {
    const isText = settings.mode === "text";

    return (
        <div className="flex flex-col gap-4">
            <div className="flex bg-white/[0.06] p-1 rounded-lg">
                <button
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${!isText ? "bg-accent text-white shadow-sm" : "text-t-muted hover:text-t-primary"}`}
                    onClick={() => onChange({ ...settings, mode: "image" })}
                >Image</button>
                <button
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${isText ? "bg-accent text-white shadow-sm" : "text-t-muted hover:text-t-primary"}`}
                    onClick={() => onChange({ ...settings, mode: "text" })}
                >Text / Emoji</button>
            </div>

            {isText ? (
                <>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2">Text Content</label>
                        <input
                            type="text"
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-t-primary focus:outline-none focus:border-accent"
                            placeholder="Enter text or emoji..."
                            value={settings.text || ""}
                            onChange={(e) => onChange({ ...settings, text: e.target.value })}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted">Font Size</label>
                            <span className="text-xs text-t-secondary">{settings.fontSize || 48}px</span>
                        </div>
                        <input
                            type="range" min="12" max="200" step="4"
                            className="w-full accent-accent h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer"
                            value={settings.fontSize || 48}
                            onChange={(e) => onChange({ ...settings, fontSize: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2">Color</label>
                        <div className="flex gap-2 items-center">
                            <div className="relative w-10 h-8 overflow-hidden rounded-lg border border-white/10">
                                <input
                                    type="color"
                                    value={settings.textColor || "#ffffff"}
                                    onChange={(e) => onChange({ ...settings, textColor: e.target.value })}
                                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                />
                            </div>
                            <input
                                type="text"
                                value={settings.textColor || "#ffffff"}
                                onChange={(e) => onChange({ ...settings, textColor: e.target.value })}
                                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-t-primary uppercase font-mono focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Watermark Image</label>
                    {settings.imagePath ? (
                        <div className="flex items-center justify-between gap-2 py-2.5 px-3 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                            <span className="text-[0.85rem] text-t-primary overflow-hidden text-ellipsis whitespace-nowrap">🖼️ Image Selected</span>
                            <button className="bg-transparent border-none text-accent text-[13px] font-medium cursor-pointer py-1 px-2 rounded-md transition-all duration-200 hover:bg-accent-subtle" onClick={onSelectImage}>Change</button>
                        </div>
                    ) : (
                        <button
                            className="w-full text-center inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-white/[0.06] text-t-primary font-semibold text-sm border border-default rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-default-hover"
                            onClick={onSelectImage}
                        >
                            Select Image
                        </button>
                    )}
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Position</label>
                <div className="grid grid-cols-2 gap-2">
                    {(["top-left", "top-right", "bottom-left", "bottom-right", "center"] as const).map((pos) => (
                        <button
                            key={pos}
                            className={`border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${settings.position === pos
                                ? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
                                : "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
                                } ${pos === "center" ? "col-span-2" : ""}`}
                            onClick={() => onChange({ ...settings, position: pos })}
                        >
                            {pos.replace("-", " ").toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
