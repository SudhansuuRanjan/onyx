import { Electroview } from "electrobun/view";
import type { CompressXRPC, CompressionProgress, CompressionResult } from "../shared/types";

// Callbacks that React will set
let onProgress: ((p: CompressionProgress) => void) | null = null;
let onComplete: ((r: CompressionResult) => void) | null = null;
let onError: ((msg: string) => void) | null = null;

const rpc = Electroview.defineRPC<CompressXRPC>({
    maxRequestTime: 300000, // 5 min — file dialog + compression can take a while
    handlers: {
        requests: {},
        messages: {
            compressionProgress: (p) => onProgress?.(p),
            compressionComplete: (r) => onComplete?.(r),
            compressionError: ({ message }) => onError?.(message),
        },
    },
});

const electroview = new Electroview({ rpc });

export function setProgressCallback(cb: (p: CompressionProgress) => void) { onProgress = cb; }
export function setCompleteCallback(cb: (r: CompressionResult) => void) { onComplete = cb; }
export function setErrorCallback(cb: (msg: string) => void) { onError = cb; }

export { electroview };
