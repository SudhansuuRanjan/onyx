import { BrowserView, BrowserWindow, Updater, Utils } from "electrobun/bun";
import type { CompressXRPC, VideoInfo, CompressionResult } from "../shared/types";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

let currentProcess: ReturnType<typeof Bun.spawn> | null = null;

// Probe video file metadata using ffprobe
async function probeVideo(filePath: string): Promise<VideoInfo | null> {
	try {
		const proc = Bun.spawn([
			"ffprobe",
			"-v", "quiet",
			"-print_format", "json",
			"-show_format",
			"-show_streams",
			filePath,
		]);

		const output = await new Response(proc.stdout).text();
		await proc.exited;

		const data = JSON.parse(output);
		const videoStream = data.streams?.find((s: any) => s.codec_type === "video");
		const format = data.format;

		if (!videoStream || !format) return null;

		const filename = filePath.split("/").pop() || filePath;

		return {
			filename,
			path: filePath,
			size: parseInt(format.size || "0"),
			duration: parseFloat(format.duration || "0"),
			width: videoStream.width || 0,
			height: videoStream.height || 0,
			codec: videoStream.codec_name || "unknown",
			bitrate: parseInt(format.bit_rate || "0"),
		};
	} catch (e) {
		console.error("ffprobe error:", e);
		return null;
	}
}

// Build ffmpeg arguments
function buildFfmpegArgs(inputPath: string, outputPath: string, quality: string, resolution: string): string[] {
	const args = [
		"ffmpeg",
		"-i", inputPath,
		"-y",
		"-progress", "pipe:1",
		"-v", "quiet",
	];

	const crfMap: Record<string, number> = { high: 23, medium: 28, low: 35 };
	args.push("-c:v", "libx264", "-crf", String(crfMap[quality] || 28), "-preset", "medium");

	if (resolution !== "original") {
		const scaleMap: Record<string, string> = { "1080p": "1920:-2", "720p": "1280:-2", "480p": "854:-2" };
		if (scaleMap[resolution]) args.push("-vf", `scale=${scaleMap[resolution]}`);
	}

	args.push("-c:a", "aac", "-b:a", "128k", outputPath);
	return args;
}

function getOutputPath(inputPath: string): string {
	const lastDot = inputPath.lastIndexOf(".");
	const ext = lastDot > -1 ? inputPath.substring(lastDot) : ".mp4";
	const base = lastDot > -1 ? inputPath.substring(0, lastDot) : inputPath;
	return `${base}_compressed${ext}`;
}

// Define RPC handlers (bun side)
const rpc = BrowserView.defineRPC<CompressXRPC>({
	maxRequestTime: 300000, // 5 minutes for long compressions
	handlers: {
		requests: {
			selectFile: async () => {
				console.log("selectFile called");
				const paths = await Utils.openFileDialog({
					startingFolder: Utils.paths.home,
					allowedFileTypes: "mp4,mov,avi,mkv,webm,flv,wmv,m4v",
					canChooseFiles: true,
					canChooseDirectory: false,
					allowsMultipleSelection: false,
				});

				if (!paths || paths.length === 0) return null;
				const info = await probeVideo(paths[0]);
				console.log("probeVideo result:", info);
				return info;
			},

			compressVideo: async ({ inputPath, settings }) => {
				console.log("compressVideo called:", inputPath, settings);
				const info = await probeVideo(inputPath);
				if (!info) {
					mainWindow.webview.rpc?.send.compressionError({ message: "Failed to read video file" });
					return null;
				}

				const outputPath = getOutputPath(inputPath);
				const totalDurationUs = info.duration * 1_000_000;
				const args = buildFfmpegArgs(inputPath, outputPath, settings.quality, settings.resolution);

				return new Promise<CompressionResult | null>((resolve) => {
					const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
					currentProcess = proc;

					// Read ffmpeg progress from stdout
					(async () => {
						const reader = proc.stdout.getReader();
						let buffer = "";
						let progressData: Record<string, string> = {};

						try {
							while (true) {
								const { done, value } = await reader.read();
								if (done) break;

								buffer += new TextDecoder().decode(value);
								const lines = buffer.split("\n");
								buffer = lines.pop() || "";

								for (const line of lines) {
									const trimmed = line.trim();
									if (trimmed === "progress=continue" || trimmed === "progress=end") {
										const outTimeUs = parseInt(progressData["out_time_ms"] || "0");
										const speed = progressData["speed"] || "0x";

										let percentage = 0;
										if (totalDurationUs > 0) {
											percentage = Math.min(99, Math.round((outTimeUs / totalDurationUs) * 100));
										}

										const speedNum = parseFloat(speed.replace("x", "")) || 0;
										let eta = "calculating...";
										if (speedNum > 0 && totalDurationUs > 0) {
											const remainingUs = totalDurationUs - outTimeUs;
											const etaS = Math.round(remainingUs / (speedNum * 1_000_000));
											eta = etaS < 60 ? `${etaS}s` : `${Math.floor(etaS / 60)}m ${etaS % 60}s`;
										}

										mainWindow.webview.rpc?.send.compressionProgress({
											percentage, speed, eta, currentTime: outTimeUs / 1_000_000,
										});
										progressData = {};
									} else {
										const [key, val] = trimmed.split("=");
										if (key && val !== undefined) progressData[key] = val;
									}
								}
							}
						} catch (_) { /* stream closed */ }
					})();

					proc.exited.then(async (exitCode) => {
						currentProcess = null;

						if (exitCode !== 0) {
							const errText = await new Response(proc.stderr).text();
							mainWindow.webview.rpc?.send.compressionError({
								message: errText || `ffmpeg exited with code ${exitCode}`,
							});
							resolve(null);
							return;
						}

						const compressedSize = Bun.file(outputPath).size;
						const result: CompressionResult = {
							outputPath,
							originalSize: info.size,
							compressedSize,
							ratio: Math.round((1 - compressedSize / info.size) * 100),
						};

						mainWindow.webview.rpc?.send.compressionComplete(result);
						mainWindow.webview.rpc?.send.compressionProgress({
							percentage: 100, speed: "", eta: "", currentTime: info.duration,
						});
						resolve(result);
					});
				});
			},

			cancelCompression: async () => {
				if (currentProcess) {
					currentProcess.kill();
					currentProcess = null;
					return true;
				}
				return false;
			},

			showInFolder: async ({ path }) => {
				Utils.showItemInFolder(path);
				return true;
			},
		},
		messages: {},
	},
});

// Check if Vite dev server is running for HMR
async function getMainViewUrl(): Promise<string> {
	const channel = await Updater.localInfo.channel();
	if (channel === "dev") {
		try {
			await fetch(DEV_SERVER_URL, { method: "HEAD" });
			console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
			return DEV_SERVER_URL;
		} catch {
			console.log("Vite dev server not running.");
		}
	}
	return "views://mainview/index.html";
}

const url = await getMainViewUrl();

const mainWindow = new BrowserWindow({
	title: "CompressX",
	url,
	rpc,
	frame: { width: 850, height: 650, x: 200, y: 200 },
});

mainWindow.on("close", () => {
	if (currentProcess) currentProcess.kill();
	Utils.quit();
});

console.log("CompressX started!");
