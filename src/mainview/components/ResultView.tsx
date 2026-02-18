import { TaskResult } from "../../shared/types";
import { formatBytes } from "../utils";

interface ResultViewProps {
    result: TaskResult;
    onShowInFolder: () => void;
    onGoBack: () => void;
    onReset: () => void;
}

export function ResultView({ result, onShowInFolder, onGoBack, onReset }: ResultViewProps) {
    return (
        <div className="bg-card border border-default rounded-xl py-9 px-8 backdrop-blur-xl text-center animate-fade-in">
            <div className="mb-7">
                <div className="w-12 h-12 text-success mx-auto mb-3 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-check-pop">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-t-primary flex items-center justify-center gap-2">{result.label}!</h3>
            </div>
            <div className="flex items-center justify-center gap-5 mb-5">
                <div className="bg-white/[0.03] rounded-lg py-4 px-7 min-w-[140px]">
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Original</span>
                    <span className="block text-xl font-bold text-t-secondary">{formatBytes(result.originalSize)}</span>
                </div>
                <div className="w-6 h-6 text-t-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </div>
                <div className="bg-white/[0.03] rounded-lg py-4 px-7 min-w-[140px]">
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Output</span>
                    <span className="block text-xl font-bold text-success">{formatBytes(result.outputSize)}</span>
                </div>
            </div>
            {result.ratio > 0 && <div className="inline-block py-2 px-5 bg-success/10 text-success font-bold text-[15px] rounded-full border border-success/20 mb-6">Saved {result.ratio}%</div>}
            {result.ratio <= 0 && <div className="inline-block py-2 px-5 bg-white/[0.08] text-t-secondary font-bold text-[15px] rounded-full border border-white/[0.08] mb-6 shadow-none">Size {Math.abs(result.ratio)}% {result.ratio === 0 ? "unchanged" : "larger"}</div>}
            <div className="flex gap-3 justify-center">
                <button className="inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-accent text-white font-semibold text-sm border-none rounded-lg cursor-pointer transition-all duration-200 shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:bg-accent-hover hover:shadow-[0_6px_24px_rgba(99,102,241,0.4)] hover:-translate-y-px" onClick={onShowInFolder}>Show in Folder</button>
                <button className="inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-white/[0.06] text-t-primary font-semibold text-sm border border-default rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-default-hover" onClick={onGoBack}>Process Again</button>
                <button className="bg-transparent border-none text-accent text-[13px] font-medium cursor-pointer py-1 px-2 rounded-md transition-all duration-200 hover:bg-accent-subtle" onClick={onReset}>New File</button>
            </div>
        </div>
    );
}
