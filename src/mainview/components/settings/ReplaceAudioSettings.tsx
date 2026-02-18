import { ReplaceAudioSettings as Settings } from "../../../shared/types";

interface ReplaceAudioSettingsProps {
    settings: Settings;
    onSelectAudio: () => void;
}

export function ReplaceAudioSettings({ settings, onSelectAudio }: ReplaceAudioSettingsProps) {
    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">New Audio Track</label>
            {settings.audioPath ? (
                <div className="flex items-center justify-between gap-2 py-2.5 px-3 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                    <span className="text-[0.85rem] text-t-primary overflow-hidden text-ellipsis whitespace-nowrap">🎵 {settings.audioFilename}</span>
                    <button className="bg-transparent border-none text-accent text-[13px] font-medium cursor-pointer py-1 px-2 rounded-md transition-all duration-200 hover:bg-accent-subtle" onClick={onSelectAudio}>Change</button>
                </div>
            ) : (
                <button
                    className="w-full text-center inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-white/[0.06] text-t-primary font-semibold text-sm border border-default rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-default-hover"
                    onClick={onSelectAudio}
                >
                    Select Audio File
                </button>
            )}
            <p className="text-[0.75rem] text-t-muted mt-2">Original audio will be replaced</p>
        </div>
    );
}
