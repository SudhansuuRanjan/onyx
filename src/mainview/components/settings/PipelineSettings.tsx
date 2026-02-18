import { PipelineSettings as Settings, PipelineStep, VideoInfo, ToolMode } from "../../../shared/types";
import { TOOLS } from "../../constants";
import { TrimSettings } from "./TrimSettings";
import { CropSettings } from "./CropSettings";
import { RotateSettings } from "./RotateSettings";
import { SpeedSettings } from "./SpeedSettings";
import { VolumeSettings } from "./VolumeSettings";
import { WatermarkSettings } from "./WatermarkSettings";
import { CompressSettings } from "./CompressSettings";
import { ConvertSettings } from "./ConvertSettings";
import { AudioSettings } from "./AudioSettings";
import { ReplaceAudioSettings } from "./ReplaceAudioSettings";
import { AspectRatioSettings } from "./AspectRatioSettings";
// Gif and Merge are excluded from pipeline for simplicity in V1

interface PipelineSettingsProps {
    settings: Settings;
    onChange: (s: Settings) => void;
    videoInfo: VideoInfo;
    onSelectImage: (index: number) => void;
    onSelectAudio: (index: number) => void;
}

export function PipelineSettings({ settings, onChange, videoInfo, onSelectImage, onSelectAudio }: PipelineSettingsProps) {
    const addStep = (mode: PipelineStep["mode"]) => {
        const newStep: PipelineStep = {
            id: Math.random().toString(36).substr(2, 9),
            mode,
            settings: getDefaultSettings(mode, videoInfo)
        };
        onChange({ steps: [...settings.steps, newStep] });
    };

    const removeStep = (index: number) => {
        const newSteps = [...settings.steps];
        newSteps.splice(index, 1);
        onChange({ steps: newSteps });
    };

    const updateStep = (index: number, newSettings: any) => {
        const newSteps = [...settings.steps];
        newSteps[index] = { ...newSteps[index], settings: newSettings };
        onChange({ steps: newSteps });
    };

    const moveStep = (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= settings.steps.length) return;
        const newSteps = [...settings.steps];
        const temp = newSteps[index];
        newSteps[index] = newSteps[index + direction];
        newSteps[index + direction] = temp;
        onChange({ steps: newSteps });
    };

    const availableTools = TOOLS.filter(t =>
        t.mode !== "merge" && t.mode !== "gif" && t.mode !== "screenshot" && t.mode !== "pipeline"
    );

    return (
        <div className="flex flex-col gap-4">
            {settings.steps.map((step, index) => {
                const tool = TOOLS.find(t => t.mode === step.mode);
                return (
                    <div key={step.id} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 animate-fade-in relative group">
                        <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{tool?.icon}</span>
                                <span className="font-semibold text-sm text-t-primary">{tool?.title}</span>
                                <span className="text-[10px] bg-white/[0.1] px-1.5 py-0.5 rounded text-t-muted">Step {index + 1}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button disabled={index === 0} onClick={() => moveStep(index, -1)} className="p-1 hover:text-accent disabled:opacity-30 disabled:hover:text-t-muted">↑</button>
                                <button disabled={index === settings.steps.length - 1} onClick={() => moveStep(index, 1)} className="p-1 hover:text-accent disabled:opacity-30 disabled:hover:text-t-muted">↓</button>
                                <button onClick={() => removeStep(index)} className="p-1 text-danger hover:bg-danger/10 rounded ml-1">✕</button>
                            </div>
                        </div>

                        <div className="pl-1">
                            {step.mode === "trim" && <TrimSettings settings={step.settings} onChange={(s) => updateStep(index, s)} duration={videoInfo.duration} />}
                            {step.mode === "crop" && <CropSettings settings={step.settings} onChange={(s) => updateStep(index, s)} videoWidth={videoInfo.width} videoHeight={videoInfo.height} />}
                            {step.mode === "rotate" && <RotateSettings settings={step.settings} onChange={(s) => updateStep(index, s)} />}
                            {step.mode === "speed" && <SpeedSettings settings={step.settings} onChange={(s) => updateStep(index, s)} />}
                            {step.mode === "volume" && <VolumeSettings settings={step.settings} onChange={(s) => updateStep(index, s)} />}
                            {step.mode === "watermark" && <WatermarkSettings settings={step.settings} onChange={(s) => updateStep(index, s)} onSelectImage={() => onSelectImage(index)} />}
                            {step.mode === "compress" && <CompressSettings settings={step.settings} onChange={(s) => updateStep(index, s)} />}
                            {step.mode === "convert" && <ConvertSettings settings={step.settings} onChange={(s) => updateStep(index, s)} />}
                            {step.mode === "audio" && <AudioSettings settings={step.settings} onChange={(s) => updateStep(index, s)} />}
                            {step.mode === "replace-audio" && <ReplaceAudioSettings settings={step.settings} onSelectAudio={() => onSelectAudio(index)} />}
                            {step.mode === "aspect-ratio" && <AspectRatioSettings settings={step.settings} onChange={(s) => updateStep(index, s)} />}
                            {step.mode === "reverse" && <div className="text-sm text-t-secondary bg-white/[0.03] p-3 rounded-lg border border-white/[0.08]">Reverses video and audio playback. No settings.</div>}
                        </div>
                    </div>
                );
            })}

            <div className="mt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Add Step</p>
                <div className="grid grid-cols-4 gap-2">
                    {availableTools.map(t => (
                        <button
                            key={t.mode}
                            className="flex flex-col items-center justify-center py-2 px-1 bg-white/[0.03] border border-transparent rounded-lg hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-95"
                            onClick={() => addStep(t.mode as PipelineStep["mode"])}
                            title={t.title}
                        >
                            <span className="text-xl mb-1">{t.icon}</span>
                            <span className="text-[10px] text-t-secondary truncate w-full text-center px-1">{t.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getDefaultSettings(mode: string, videoInfo: VideoInfo): any {
    switch (mode) {
        case "trim": return { startTime: 0, endTime: videoInfo.duration };
        case "crop": return { x: 0, y: 0, width: videoInfo.width, height: videoInfo.height };
        case "rotate": return { angle: 0, flip: "none" };
        case "speed": return { speed: 1 };
        case "volume": return { volume: 1 };
        case "watermark": return { mode: "image", imagePath: "", text: "", textColor: "#ffffff", fontSize: 48, position: "top-left" };
        case "compress": return { quality: "medium", resolution: "original" };
        case "convert": return { format: "mp4" };
        case "audio": return { action: "strip", outputFormat: "mp3" };
        case "replace-audio": return { audioPath: "", audioFilename: "" };
        case "aspect-ratio": return { ratio: "9:16", background: "blur" };
        case "reverse": return { dummy: true };
        default: return {};
    }
}
