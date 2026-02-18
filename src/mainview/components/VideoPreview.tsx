import { VideoInfo } from "../../shared/types";
import { formatBytes, formatDuration } from "../utils";

interface VideoPreviewProps {
    videoInfo: VideoInfo;
    onReset: () => void;
}

export function VideoPreview({ videoInfo, onReset }: VideoPreviewProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="bg-card border border-default rounded-xl backdrop-blur-xl p-0 overflow-hidden bg-black mb-4">
                <video
                    src={`http://localhost:50100/preview?path=${encodeURIComponent(videoInfo.path)}`}
                    controls
                    autoPlay
                    muted
                    loop
                    preload="auto"
                    className="w-full max-h-[320px] block object-contain rounded-xl"
                />
            </div>

            <div className="bg-card border border-default rounded-xl p-6 mb-4 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-t-primary flex items-center gap-2 mb-0 overflow-hidden text-ellipsis whitespace-nowrap max-w-[80%]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {videoInfo.filename}
                    </h3>
                    <button className="bg-transparent border-none text-accent text-[13px] font-medium cursor-pointer py-1 px-2 rounded-md transition-all duration-200 hover:bg-accent-subtle" onClick={onReset}>Change File</button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                    <div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Size</span><span className="block text-[15px] font-semibold text-t-primary">{formatBytes(videoInfo.size)}</span></div>
                    <div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Resolution</span><span className="block text-[15px] font-semibold text-t-primary">{videoInfo.width}×{videoInfo.height}</span></div>
                    <div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Duration</span><span className="block text-[15px] font-semibold text-t-primary">{formatDuration(videoInfo.duration)}</span></div>
                    <div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Codec</span><span className="block text-[15px] font-semibold text-t-primary">{videoInfo.codec.toUpperCase()}</span></div>
                    <div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Audio</span><span className="block text-[15px] font-semibold text-t-primary">{videoInfo.hasAudio ? "Yes" : "No audio"}</span></div>
                </div>
            </div>
        </div>
    );
}
