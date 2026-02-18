import { ToolMode } from "../../shared/types";
import { TOOLS } from "../constants";

interface ToolPickerProps {
    currentMode: ToolMode;
    setMode: (mode: ToolMode) => void;
}

export function ToolPicker({ currentMode, setMode }: ToolPickerProps) {
    return (
        <div className="grid grid-cols-5 gap-2.5 mb-4">
            {TOOLS.map((t) => (
                <button
                    key={t.mode}
                    className={`flex flex-col items-center gap-1 py-4 px-3 border rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-[12px] ${currentMode === t.mode
                        ? "bg-accent-subtle border-accent text-t-primary shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        : "bg-card border-default text-t-secondary hover:bg-card-hover hover:border-default-hover hover:text-t-primary hover:-translate-y-px"
                        }`}
                    onClick={() => {
                        document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
                        setMode(t.mode);
                    }}
                >
                    <span className="text-[1.6rem] leading-none">{t.icon}</span>
                    <span className="text-[0.95rem] font-semibold tracking-[0.01em]">{t.title}</span>
                    <span className={`text-[0.72rem] text-center ${currentMode === t.mode ? "text-t-secondary" : "text-t-muted"}`}>{t.desc}</span>
                </button>
            ))}
        </div>
    );
}
