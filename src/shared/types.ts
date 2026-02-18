import { RPCSchema } from "electrobun/bun";

export type VideoInfo = {
    filename: string;
    path: string;
    size: number;
    duration: number;
    width: number;
    height: number;
    codec: string;
    bitrate: number;
    hasAudio: boolean;
};

// Tool modes
export type ToolMode = "compress" | "convert" | "audio" | "gif" | "merge" | "trim" | "crop" | "rotate" | "speed" | "volume" | "watermark" | "screenshot" | "replace-audio";

// Per-tool settings
export type CompressionSettings = {
    quality: "high" | "medium" | "low";
    resolution: "original" | "1080p" | "720p" | "480p";
};

export type ConvertSettings = {
    format: "mp4" | "mkv" | "avi" | "webm" | "mov";
};

export type AudioAction = "extract" | "strip" | "mute";
export type AudioFormat = "mp3" | "aac" | "wav";
export type AudioSettings = {
    action: AudioAction;
    outputFormat: AudioFormat; // only used when action === "extract"
};

export type GifSettings = {
    fps: 10 | 15 | 24;
    width: 320 | 480 | 640 | 0; // 0 = original
};

export type MergeSettings = {
    secondPath: string;
    secondFilename: string;
};

export type TrimSettings = {
    startTime: number;
    endTime: number;
};

export type CropSettings = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type RotateSettings = {
    angle: 0 | 90 | 180 | 270;
    flip: "none" | "horizontal" | "vertical";
};

export type SpeedSettings = {
    speed: 0.5 | 1 | 1.5 | 2 | 4;
};

export type VolumeSettings = {
    volume: number; // 0.0 to 2.0 (200%)
};

export type WatermarkSettings = {
    imagePath: string;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
};

export type ScreenshotSettings = {
    timestamp: number;
};

export type ReplaceAudioSettings = {
    audioPath: string;
    audioFilename: string;
};

// Progress/result types (shared across all tools)
export type TaskProgress = {
    percentage: number;
    speed: string;
    eta: string;
    currentTime: number;
};

export type TaskResult = {
    outputPath: string;
    originalSize: number;
    outputSize: number;
    ratio: number;
    toolMode: ToolMode;
    label: string; // e.g. "Compressed", "Converted to MKV", "Audio extracted as MP3"
};

// RPC schema
export type CompressXRPC = {
    bun: RPCSchema<{
        requests: {
            readVideoInfo: {
                params: { inputPath: string };
                response: VideoInfo | null;
            };
            selectFile: {
                params: {};
                response: VideoInfo | null;
            };
            compressVideo: {
                params: { inputPath: string; settings: CompressionSettings };
                response: TaskResult | null;
            };
            convertVideo: {
                params: { inputPath: string; settings: ConvertSettings };
                response: TaskResult | null;
            };
            processAudio: {
                params: { inputPath: string; settings: AudioSettings };
                response: TaskResult | null;
            };
            makeGif: {
                params: { inputPath: string; settings: GifSettings };
                response: TaskResult | null;
            };
            cancelTask: {
                params: {};
                response: boolean;
            };
            showInFolder: {
                params: { path: string };
                response: boolean;
            };
            selectSecondFile: {
                params: {};
                response: { path: string; filename: string } | null;
            };
            mergeVideos: {
                params: { inputPath: string; settings: MergeSettings };
                response: TaskResult | null;
            };
            // New Tools
            trimVideo: {
                params: { inputPath: string; settings: TrimSettings };
                response: TaskResult | null;
            };
            cropVideo: {
                params: { inputPath: string; settings: CropSettings };
                response: TaskResult | null;
            };
            rotateVideo: {
                params: { inputPath: string; settings: RotateSettings };
                response: TaskResult | null;
            };
            changeSpeed: {
                params: { inputPath: string; settings: SpeedSettings };
                response: TaskResult | null;
            };
            adjustVolume: {
                params: { inputPath: string; settings: VolumeSettings };
                response: TaskResult | null;
            };
            addWatermark: {
                params: { inputPath: string; settings: WatermarkSettings };
                response: TaskResult | null;
            };
            takeScreenshot: {
                params: { inputPath: string; settings: ScreenshotSettings };
                response: TaskResult | null;
            };
            replaceAudio: {
                params: { inputPath: string; settings: ReplaceAudioSettings };
                response: TaskResult | null;
            };
            selectImage: {
                params: {};
                response: { path: string; filename: string } | null;
            };
            selectAudioFile: {
                params: {};
                response: { path: string; filename: string } | null;
            };
        };
        messages: {};
    }>;
    webview: RPCSchema<{
        requests: {};
        messages: {
            taskProgress: TaskProgress;
            taskComplete: TaskResult;
            taskError: { message: string };
        };
    }>;
};
