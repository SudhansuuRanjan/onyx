import {
    ToolMode, VideoInfo,
    CompressionSettings as CompressionSettingsType, ConvertSettings as ConvertSettingsType, AudioSettings as AudioSettingsType, GifSettings as GifSettingsType, MergeSettings as MergeSettingsType,
    TrimSettings as TrimSettingsType, CropSettings as CropSettingsType, RotateSettings as RotateSettingsType,
    SpeedSettings as SpeedSettingsType, VolumeSettings as VolumeSettingsType, WatermarkSettings as WatermarkSettingsType,
    ScreenshotSettings as ScreenshotSettingsType, ReplaceAudioSettings as ReplaceAudioSettingsType,
    PipelineSettings as PipelineSettingsType, AspectRatioSettings as AspectRatioSettingsType
} from "../../shared/types";
import { TOOLS } from "../constants";

import { CompressSettings } from "./settings/CompressSettings";
import { ConvertSettings } from "./settings/ConvertSettings";
import { AudioSettings } from "./settings/AudioSettings";
import { GifSettings } from "./settings/GifSettings";
import { MergeSettings } from "./settings/MergeSettings";
import { TrimSettings } from "./settings/TrimSettings";
import { CropSettings } from "./settings/CropSettings";
import { RotateSettings } from "./settings/RotateSettings";
import { SpeedSettings } from "./settings/SpeedSettings";
import { VolumeSettings } from "./settings/VolumeSettings";
import { WatermarkSettings } from "./settings/WatermarkSettings";
import { ScreenshotSettings } from "./settings/ScreenshotSettings";
import { ReplaceAudioSettings } from "./settings/ReplaceAudioSettings";
import { PipelineSettings } from "./settings/PipelineSettings";
import { AspectRatioSettings } from "./settings/AspectRatioSettings";

interface ToolSettingsProps {
    toolMode: ToolMode;
    videoInfo: VideoInfo;

    compressSettings: CompressionSettingsType; setCompressSettings: (s: CompressionSettingsType) => void;
    convertSettings: ConvertSettingsType; setConvertSettings: (s: ConvertSettingsType) => void;
    audioSettings: AudioSettingsType; setAudioSettings: (s: AudioSettingsType) => void;
    gifSettings: GifSettingsType; setGifSettings: (s: GifSettingsType) => void;
    mergeSettings: MergeSettingsType; onSelectSecondFile: () => void;
    trimSettings: TrimSettingsType; setTrimSettings: (s: TrimSettingsType) => void;
    cropSettings: CropSettingsType; setCropSettings: (s: CropSettingsType) => void;
    rotateSettings: RotateSettingsType; setRotateSettings: (s: RotateSettingsType) => void;
    speedSettings: SpeedSettingsType; setSpeedSettings: (s: SpeedSettingsType) => void;
    volumeSettings: VolumeSettingsType; setVolumeSettings: (s: VolumeSettingsType) => void;
    watermarkSettings: WatermarkSettingsType; setWatermarkSettings: (s: WatermarkSettingsType) => void; onSelectImage: () => void;
    screenshotSettings: ScreenshotSettingsType; setScreenshotSettings: (s: ScreenshotSettingsType) => void;
    replaceAudioSettings: ReplaceAudioSettingsType; onSelectAudio: () => void;
    aspectRatioSettings: AspectRatioSettingsType; setAspectRatioSettings: (s: AspectRatioSettingsType) => void;


    pipelineSettings: PipelineSettingsType; setPipelineSettings: (s: PipelineSettingsType) => void;
    onSelectPipelineImage: (index: number) => void;
    onSelectPipelineAudio: (index: number) => void;

    startLabel: string;
    canStart: boolean;
    onStart: () => void;
}

export function ToolSettings(props: ToolSettingsProps) {
    const { toolMode, videoInfo } = props;
    const toolTitle = TOOLS.find(t => t.mode === toolMode)?.title;

    return (
        <div className="flex flex-col gap-3 sticky">
            <div className="bg-card border border-default rounded-xl p-6 backdrop-blur-xl">
                <h3 className="text-[15px] font-semibold text-t-primary mb-4 flex items-center gap-2">
                    {toolTitle} Settings
                </h3>

                {toolMode === "compress" && <CompressSettings settings={props.compressSettings} onChange={props.setCompressSettings} />}
                {toolMode === "convert" && <ConvertSettings settings={props.convertSettings} onChange={props.setConvertSettings} />}
                {toolMode === "audio" && <AudioSettings settings={props.audioSettings} onChange={props.setAudioSettings} />}
                {toolMode === "gif" && <GifSettings settings={props.gifSettings} onChange={props.setGifSettings} />}
                {toolMode === "merge" && <MergeSettings settings={props.mergeSettings} onSelectSecondFile={props.onSelectSecondFile} />}

                {toolMode === "trim" && <TrimSettings settings={props.trimSettings} onChange={props.setTrimSettings} duration={videoInfo.duration} />}
                {toolMode === "crop" && <CropSettings settings={props.cropSettings} onChange={props.setCropSettings} videoWidth={videoInfo.width} videoHeight={videoInfo.height} />}
                {toolMode === "rotate" && <RotateSettings settings={props.rotateSettings} onChange={props.setRotateSettings} />}
                {toolMode === "speed" && <SpeedSettings settings={props.speedSettings} onChange={props.setSpeedSettings} />}

                {toolMode === "volume" && <VolumeSettings settings={props.volumeSettings} onChange={props.setVolumeSettings} />}
                {toolMode === "watermark" && <WatermarkSettings settings={props.watermarkSettings} onChange={props.setWatermarkSettings} onSelectImage={props.onSelectImage} />}
                {toolMode === "screenshot" && <ScreenshotSettings settings={props.screenshotSettings} onChange={props.setScreenshotSettings} duration={videoInfo.duration} />}
                {toolMode === "replace-audio" && <ReplaceAudioSettings settings={props.replaceAudioSettings} onSelectAudio={props.onSelectAudio} />}
                {toolMode === "aspect-ratio" && <AspectRatioSettings settings={props.aspectRatioSettings} onChange={props.setAspectRatioSettings} />}


                {toolMode === "pipeline" && <PipelineSettings settings={props.pipelineSettings} onChange={props.setPipelineSettings} videoInfo={videoInfo} onSelectImage={props.onSelectPipelineImage} onSelectAudio={props.onSelectPipelineAudio} />}
            </div>

            <button
                className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-accent text-white font-semibold text-sm border-none rounded-lg cursor-pointer transition-all duration-200 shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:bg-accent-hover hover:shadow-[0_6px_24px_rgba(99,102,241,0.4)] hover:-translate-y-px ${!props.canStart ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={props.onStart}
                disabled={!props.canStart}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
                    <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {props.startLabel}
            </button>
        </div>
    );
}
