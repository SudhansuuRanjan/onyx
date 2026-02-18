export function Header() {
    return (
        <header className="pt-5 px-7">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 text-accent drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-t-primary to-accent-hover bg-clip-text text-transparent">CompressX</h1>
                </div>
                <p className="text-[13px] text-t-muted font-normal">Video tools powered by ffmpeg</p>
            </div>
        </header>
    );
}
