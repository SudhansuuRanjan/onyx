interface ErrorViewProps {
    error: string;
    onRetry: () => void;
    onReset: () => void;
}

export function ErrorView({ error, onRetry, onReset }: ErrorViewProps) {
    return (
        <div className="bg-card border border-default rounded-xl py-10 px-8 backdrop-blur-xl text-center animate-fade-in">
            <div className="w-12 h-12 text-danger mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-danger flex items-center justify-center gap-2 mb-4">Task Failed</h3>
            <p className="text-t-secondary text-[13px] mb-5 max-h-[120px] overflow-y-auto break-words p-3 bg-danger/5 rounded-lg">{error}</p>
            <div className="flex gap-3 justify-center">
                <button className="inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-white/[0.06] text-t-primary font-semibold text-sm border border-default rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-default-hover" onClick={onRetry}>Try Again</button>
                <button className="bg-transparent border-none text-accent text-[13px] font-medium cursor-pointer py-1 px-2 rounded-md transition-all duration-200 hover:bg-accent-subtle" onClick={onReset}>New File</button>
            </div>
        </div>
    );
}
