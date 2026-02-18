import { TaskProgress } from "../../shared/types";

interface ProcessingViewProps {
    progress: TaskProgress;
    onCancel: () => void;
}

export function ProcessingView({ progress, onCancel }: ProcessingViewProps) {
    return (
        <div className="bg-card border border-default rounded-xl p-10 backdrop-blur-xl text-center animate-fade-in">
            <h3 className="text-lg font-semibold text-t-primary mb-7 flex items-center justify-center gap-2">Processing...</h3>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-5">
                <div
                    className="h-full bg-gradient-to-r from-accent to-[#a78bfa] rounded-full transition-[width] duration-300 ease-out relative"
                    style={{ width: `${progress.percentage}%` }}
                >
                    <div className="absolute -top-0.5 right-0 w-10 h-3 bg-accent-glow rounded-full blur-[8px] animate-pulse" />
                </div>
            </div>
            <div className="flex justify-between items-center mb-6">
                <span className="text-[32px] font-bold bg-gradient-to-br from-accent to-[#a78bfa] bg-clip-text text-transparent">
                    {progress.percentage}%
                </span>
                <div className="flex gap-5 text-[13px] text-t-secondary">
                    {progress.speed && <span>Speed: {progress.speed}</span>}
                    {progress.eta && <span>ETA: {progress.eta}</span>}
                </div>
            </div>
            <button
                className="mt-1 inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-transparent text-danger font-semibold text-[13px] border border-danger/30 rounded-lg cursor-pointer transition-all duration-200 hover:bg-danger/10 hover:border-danger"
                onClick={onCancel}
            >
                Cancel
            </button>
        </div>
    );
}
