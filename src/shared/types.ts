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
};

export type CompressionSettings = {
    quality: "high" | "medium" | "low";
    resolution: "original" | "1080p" | "720p" | "480p";
};

export type CompressionProgress = {
    percentage: number;
    speed: string;
    eta: string;
    currentTime: number;
};

export type CompressionResult = {
    outputPath: string;
    originalSize: number;
    compressedSize: number;
    ratio: number;
};

export type CompressXRPC = {
    bun: RPCSchema<{
        requests: {
            selectFile: {
                params: {};
                response: VideoInfo | null;
            };
            compressVideo: {
                params: {
                    inputPath: string;
                    settings: CompressionSettings;
                };
                response: CompressionResult | null;
            };
            cancelCompression: {
                params: {};
                response: boolean;
            };
            showInFolder: {
                params: { path: string };
                response: boolean;
            };
        };
        messages: {};
    }>;
    webview: RPCSchema<{
        requests: {};
        messages: {
            compressionProgress: CompressionProgress;
            compressionComplete: CompressionResult;
            compressionError: { message: string };
        };
    }>;
};
