import { FEATURES } from "../constants";

export function IdleView({ onSelectFile }: { onSelectFile: () => void }) {
    return (
        <div className="animate-fade-in">
            <div
                className="bg-card border-default rounded-xl p-6 mb-4 backdrop-blur-xl transition-all duration-200 flex justify-center items-center min-h-[320px] cursor-pointer border-2 border-dashed border-default hover:border-accent hover:bg-accent-subtle"
                onClick={onSelectFile}
            >
                <div className="text-center">
                    <div className="w-14 h-14 text-t-muted mx-auto mb-5 transition-all duration-200 hover:text-accent hover:-translate-y-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-t-primary mb-1.5">Select a Video File</h2>
                    <p className="text-t-secondary text-sm">Click to browse for a video file</p>
                    <p className="mt-4 text-xs text-t-muted py-2 px-4 bg-white/[0.03] rounded-[20px] inline-block">MP4, MOV, AVI, MKV, WebM, FLV, WMV</p>
                </div>
            </div>

            {/* Feature showcase */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {FEATURES.map((f) => (
                    <div key={f.title} className="flex flex-col justify-center items-start gap-1 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl transition-all duration-200 hover:bg-white/[0.06] hover:border-white/10 hover:-translate-y-0.5 group h-full">
                        <div className="text-2xl mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity">{f.icon}</div>
                        <span className="block text-[0.9rem] font-semibold text-t-primary">{f.title}</span>
                        <span className="block text-[0.75rem] text-t-muted leading-relaxed">{f.desc}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
