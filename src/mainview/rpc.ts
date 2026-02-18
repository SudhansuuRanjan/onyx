import { Electroview } from "electrobun/view";
import type { CompressXRPC, TaskProgress, TaskResult } from "../shared/types";

// Callbacks that React will set
let onProgress: ((p: TaskProgress) => void) | null = null;
let onComplete: ((r: TaskResult) => void) | null = null;
let onError: ((msg: string) => void) | null = null;

const rpc = Electroview.defineRPC<CompressXRPC>({
    maxRequestTime: 300000, // 5 min — file dialog + long tasks
    handlers: {
        requests: {},
        messages: {
            taskProgress: (p) => onProgress?.(p),
            taskComplete: (r) => onComplete?.(r),
            taskError: ({ message }) => onError?.(message),
        },
    },
});

const electroview = new Electroview({ rpc });

export function setProgressCallback(cb: (p: TaskProgress) => void) { onProgress = cb; }
export function setCompleteCallback(cb: (r: TaskResult) => void) { onComplete = cb; }
export function setErrorCallback(cb: (msg: string) => void) { onError = cb; }

export { electroview };
