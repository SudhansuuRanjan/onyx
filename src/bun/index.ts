import { BrowserView, BrowserWindow, Updater, Utils } from "electrobun/bun";
import type { CompressXRPC, VideoInfo, TaskResult } from "../shared/types";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

let currentProcess: ReturnType<typeof Bun.spawn> | null = null;

// ─── Utilities ──────────────────────────────────────────────────────────

async function probeVideo(filePath: string): Promise<VideoInfo | null> {
	try {
		const proc = Bun.spawn([
			"ffprobe", "-v", "quiet", "-print_format", "json",
			"-show_format", "-show_streams", filePath,
		]);
		const output = await new Response(proc.stdout).text();
		await proc.exited;
		const data = JSON.parse(output);
		const videoStream = data.streams?.find((s: any) => s.codec_type === "video");
		const audioStream = data.streams?.find((s: any) => s.codec_type === "audio");
		const format = data.format;
		if (!videoStream || !format) return null;
		return {
			filename: filePath.split("/").pop() || filePath,
			path: filePath,
			size: parseInt(format.size || "0"),
			duration: parseFloat(format.duration || "0"),
			width: videoStream.width || 0,
			height: videoStream.height || 0,
			codec: videoStream.codec_name || "unknown",
			bitrate: parseInt(format.bit_rate || "0"),
			hasAudio: !!audioStream,
		};
	} catch (e) {
		console.error("ffprobe error:", e);
		return null;
	}
}

function getBasePath(inputPath: string): { base: string; ext: string } {
	const lastDot = inputPath.lastIndexOf(".");
	const ext = lastDot > -1 ? inputPath.substring(lastDot) : ".mp4";
	const base = lastDot > -1 ? inputPath.substring(0, lastDot) : inputPath;
	return { base, ext };
}

/** Run an ffmpeg command with progress streaming back to the webview */
async function runFfmpegWithProgress(
	args: string[],
	totalDurationUs: number,
): Promise<{ exitCode: number; stderr: string }> {
	return new Promise((resolve) => {
		const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
		currentProcess = proc;
		let stderrText = "";

		// Parse progress from stdout
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
							mainWindow.webview.rpc?.send.taskProgress({
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

		// Capture stderr
		(async () => {
			try { stderrText = await new Response(proc.stderr).text(); } catch (_) { }
		})();

		proc.exited.then((exitCode) => {
			currentProcess = null;
			resolve({ exitCode: exitCode ?? 1, stderr: stderrText });
		});
	});
}

/** Common wrapper: run ffmpeg, handle result, send messages */
async function executeTask(
	args: string[],
	outputPath: string,
	originalSize: number,
	duration: number,
	toolMode: TaskResult["toolMode"],
	label: string,
): Promise<TaskResult | null> {
	const totalDurationUs = duration * 1_000_000;
	const { exitCode, stderr } = await runFfmpegWithProgress(args, totalDurationUs);

	if (exitCode !== 0) {
		const errMsg = stderr?.trim() || `ffmpeg exited with code ${exitCode}`;
		console.error("ffmpeg error:", errMsg);
		mainWindow.webview.rpc?.send.taskError({ message: errMsg });
		return null;
	}

	const outputSize = Bun.file(outputPath).size;
	const result: TaskResult = {
		outputPath,
		originalSize,
		outputSize,
		ratio: Math.round((1 - outputSize / originalSize) * 100),
		toolMode,
		label,
	};

	mainWindow.webview.rpc?.send.taskProgress({ percentage: 100, speed: "", eta: "", currentTime: duration });
	mainWindow.webview.rpc?.send.taskComplete(result);
	return result;
}

// ─── RPC Handlers ───────────────────────────────────────────────────────

const rpc = BrowserView.defineRPC<CompressXRPC>({
	maxRequestTime: 300000,
	handlers: {
		requests: {
			selectFile: async () => {
				const paths = await Utils.openFileDialog({
					startingFolder: Utils.paths.home,
					allowedFileTypes: "mp4,mov,avi,mkv,webm,flv,wmv,m4v",
					canChooseFiles: true,
					canChooseDirectory: false,
					allowsMultipleSelection: false,
				});
				if (!paths || paths.length === 0) return null;
				const info = await probeVideo(paths[0]);
				return info;
			},

			selectImage: async () => {
				const paths = await Utils.openFileDialog({
					allowedFileTypes: "png,jpg,jpeg,webp",
					canChooseFiles: true,
					canChooseDirectory: false,
					allowsMultipleSelection: false,
				});
				if (!paths || paths.length === 0) return null;
				const filename = paths[0].split("/").pop() || paths[0];
				return { path: paths[0], filename };
			},

			selectAudioFile: async () => {
				const paths = await Utils.openFileDialog({
					allowedFileTypes: "mp3,wav,aac,m4a,flac,ogg",
					canChooseFiles: true,
					canChooseDirectory: false,
					allowsMultipleSelection: false,
				});
				if (!paths || paths.length === 0) return null;
				const filename = paths[0].split("/").pop() || paths[0];
				return { path: paths[0], filename };
			},

			// ── Compress ────────────────────────────────────────────
			compressVideo: async ({ inputPath, settings }) => {
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base } = getBasePath(inputPath);
				const outputPath = `${base}_compressed.mp4`;
				const crfMap: Record<string, number> = { high: 23, medium: 28, low: 35 };
				const args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
					"-c:v", "libx264", "-crf", String(crfMap[settings.quality] || 28), "-preset", "medium"];

				if (settings.resolution !== "original") {
					const scaleMap: Record<string, string> = { "1080p": "1920:-2", "720p": "1280:-2", "480p": "854:-2" };
					if (scaleMap[settings.resolution]) args.push("-vf", `scale=${scaleMap[settings.resolution]}`);
				}
				args.push("-c:a", "aac", "-b:a", "128k", outputPath);

				return executeTask(args, outputPath, info.size, info.duration, "compress", "Compressed");
			},

			// ── Convert Format ──────────────────────────────────────
			convertVideo: async ({ inputPath, settings }) => {
				console.log("convertVideo:", inputPath, settings);
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base } = getBasePath(inputPath);
				const outputPath = `${base}_converted.${settings.format}`;

				// Use codec copy when possible, re-encode for WebM (VP9+Opus)
				let args: string[];
				if (settings.format === "webm") {
					args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
						"-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0",
						"-c:a", "libopus", "-b:a", "128k", outputPath];
				} else {
					args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
						"-c:v", "copy", "-c:a", "copy", outputPath];
				}

				const label = `Converted to ${settings.format.toUpperCase()}`;
				return executeTask(args, outputPath, info.size, info.duration, "convert", label);
			},

			// ── Audio Tools ─────────────────────────────────────────
			processAudio: async ({ inputPath, settings }) => {
				console.log("processAudio:", inputPath, settings);
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				// Check if video has an audio stream
				if (!info.hasAudio && (settings.action === "extract" || settings.action === "mute")) {
					mainWindow.webview.rpc?.send.taskError({ message: "This video has no audio stream" });
					return null;
				}

				const { base } = getBasePath(inputPath);
				let outputPath: string;
				let args: string[];
				let label: string;

				if (settings.action === "extract") {
					const codecMap: Record<string, string[]> = {
						mp3: ["-c:a", "libmp3lame", "-q:a", "2"],
						aac: ["-c:a", "aac", "-b:a", "192k"],
						wav: ["-c:a", "pcm_s16le"],
					};
					outputPath = `${base}_audio.${settings.outputFormat}`;

					// Extract thumbnail for MP3/AAC cover art
					const thumbPath = `${base}_thumb.jpg`;
					let hasThumb = false;
					if (settings.outputFormat !== "wav") {
						const thumbProc = Bun.spawn([
							"ffmpeg", "-i", inputPath, "-y", "-v", "quiet",
							"-ss", "1", "-vframes", "1", "-q:v", "2", thumbPath,
						], { stdout: "pipe", stderr: "pipe" });
						await thumbProc.exited;
						hasThumb = await Bun.file(thumbPath).exists();
					}

					if (hasThumb) {
						// Embed thumbnail as cover art
						args = ["ffmpeg", "-i", inputPath, "-i", thumbPath, "-y",
							"-progress", "pipe:1", "-v", "quiet",
							"-map", "0:a", "-map", "1:0",
							...codecMap[settings.outputFormat],
							"-id3v2_version", "3",
							"-metadata:s:v", "title=Cover", "-metadata:s:v", "comment=Cover (front)",
							"-disposition:v:0", "attached_pic",
							outputPath];
					} else {
						args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
							"-vn", ...codecMap[settings.outputFormat], outputPath];
					}
					label = `Audio extracted as ${settings.outputFormat.toUpperCase()}`;

					const result = await executeTask(args, outputPath, info.size, info.duration, "audio", label);
					// Clean up temp thumbnail
					if (hasThumb) try { Bun.spawn(["rm", thumbPath]); } catch (_) { }
					return result;

				} else if (settings.action === "strip") {
					outputPath = `${base}_noaudio${getBasePath(inputPath).ext}`;
					args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
						"-an", "-c:v", "copy", outputPath];
					label = "Audio stripped";

				} else {
					// mute — keep audio track but zero volume
					outputPath = `${base}_muted${getBasePath(inputPath).ext}`;
					args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
						"-c:v", "copy", "-af", "volume=0", outputPath];
					label = "Audio muted";
				}

				return executeTask(args, outputPath, info.size, info.duration, "audio", label);
			},

			// ── GIF Creation ────────────────────────────────────────
			makeGif: async ({ inputPath, settings }) => {
				console.log("makeGif:", inputPath, settings);
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base } = getBasePath(inputPath);
				const palettePath = `${base}_palette.png`;
				const outputPath = `${base}.gif`;
				const width = settings.width === 0 ? -1 : settings.width;
				const fps = settings.fps;
				const filters = `fps=${fps},scale=${width}:-1:flags=lanczos`;

				// Pass 1: Generate palette
				mainWindow.webview.rpc?.send.taskProgress({ percentage: 0, speed: "", eta: "Generating palette...", currentTime: 0 });
				const palProc = Bun.spawn([
					"ffmpeg", "-i", inputPath, "-y", "-v", "quiet",
					"-vf", `${filters},palettegen`, palettePath,
				], { stdout: "pipe", stderr: "pipe" });
				await palProc.exited;

				// Pass 2: Create GIF with palette
				const args = ["ffmpeg", "-i", inputPath, "-i", palettePath, "-y",
					"-progress", "pipe:1", "-v", "quiet",
					"-lavfi", `${filters} [x];[x][1:v]paletteuse`, outputPath];

				const result = await executeTask(args, outputPath, info.size, info.duration, "gif", "GIF created");

				// Clean up palette file
				try { await Bun.file(palettePath).exists() && Bun.spawn(["rm", palettePath]); } catch (_) { }

				return result;
			},

			cancelTask: async () => {
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

			selectSecondFile: async () => {
				const paths = await Utils.openFileDialog({
					startingFolder: Utils.paths.home,
					allowedFileTypes: "mp4,mov,avi,mkv,webm,flv,wmv,m4v",
					canChooseFiles: true,
					canChooseDirectory: false,
					allowsMultipleSelection: false,
				});
				if (!paths || paths.length === 0) return null;
				const filename = paths[0].split("/").pop() || paths[0];
				return { path: paths[0], filename };
			},

			// ── New Tools ───────────────────────────────────────────
			trimVideo: async ({ inputPath, settings }) => {
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base, ext } = getBasePath(inputPath);
				const outputPath = `${base}_trimmed${ext}`;
				const duration = settings.endTime - settings.startTime;

				// Use re-encode for frame-accurate seeking
				const args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
					"-ss", String(settings.startTime), "-to", String(settings.endTime),
					"-c:v", "libx264", "-crf", "23", "-preset", "fast", "-c:a", "aac", outputPath];

				return executeTask(args, outputPath, info.size, duration, "trim", "Video trimmed");
			},

			cropVideo: async ({ inputPath, settings }) => {
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base, ext } = getBasePath(inputPath);
				const outputPath = `${base}_cropped${ext}`;
				const { width, height, x, y } = settings;

				const args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
					"-vf", `crop=${width}:${height}:${x}:${y}`,
					"-c:v", "libx264", "-crf", "23", "-c:a", "copy", outputPath];

				return executeTask(args, outputPath, info.size, info.duration, "crop", "Video cropped");
			},

			rotateVideo: async ({ inputPath, settings }) => {
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base, ext } = getBasePath(inputPath);
				const outputPath = `${base}_rotated${ext}`;
				const filters: string[] = [];

				if (settings.angle === 90) filters.push("transpose=1"); // 90 CW
				else if (settings.angle === 180) filters.push("transpose=1,transpose=1"); // 180
				else if (settings.angle === 270) filters.push("transpose=2"); // 90 CCW

				if (settings.flip === "horizontal") filters.push("hflip");
				if (settings.flip === "vertical") filters.push("vflip");

				if (filters.length === 0) {
					mainWindow.webview.rpc?.send.taskError({ message: "No rotation applied" }); // Should be blocked by UI
					return null;
				}

				const args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
					"-vf", filters.join(","),
					"-c:v", "libx264", "-crf", "23", "-c:a", "copy", outputPath];

				return executeTask(args, outputPath, info.size, info.duration, "rotate", "Video rotated");
			},

			changeSpeed: async ({ inputPath, settings }) => {
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base, ext } = getBasePath(inputPath);
				const speedStr = settings.speed === 0.5 ? "0.5x" : settings.speed + "x";
				const outputPath = `${base}_${speedStr}${ext}`;

				// For video PTS: setpts=PTS/SPEED
				// For audio atempo: atempo=SPEED
				const videoFilter = `[0:v]setpts=PTS/${settings.speed}[v]`;
				const audioFilter = `[0:a]atempo=${settings.speed}[a]`;

				const args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
					"-filter_complex", `${videoFilter};${audioFilter}`,
					"-map", "[v]", "-map", "[a]",
					"-c:v", "libx264", "-crf", "23", "-c:a", "aac", outputPath];

				const newDuration = info.duration / settings.speed;
				return executeTask(args, outputPath, info.size, newDuration, "speed", `Speed changed to ${speedStr}`);
			},
			readVideoInfo: async ({ inputPath }) => {
				return await probeVideo(inputPath);
			},

			adjustVolume: async ({ inputPath, settings }) => {
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base, ext } = getBasePath(inputPath);
				const outputPath = `${base}_volume${ext}`;
				const vol = settings.volume;

				// -af volume=1.5
				const args = ["ffmpeg", "-i", inputPath, "-y", "-progress", "pipe:1", "-v", "quiet",
					"-af", `volume=${vol}`,
					"-c:v", "copy", "-c:a", "aac", "-b:a", "192k", outputPath];

				return executeTask(args, outputPath, info.size, info.duration, "volume", `Volume set to ${Math.round(vol * 100)}%`);
			},

			addWatermark: async ({ inputPath, settings }) => {
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base, ext } = getBasePath(inputPath);
				const outputPath = `${base}_watermarked${ext}`;

				let overlayStr = "10:10"; // top-left default
				switch (settings.position) {
					case "top-right": overlayStr = "main_w-overlay_w-10:10"; break;
					case "bottom-left": overlayStr = "10:main_h-overlay_h-10"; break;
					case "bottom-right": overlayStr = "main_w-overlay_w-10:main_h-overlay_h-10"; break;
					case "center": overlayStr = "(main_w-overlay_w)/2:(main_h-overlay_h)/2"; break;
				}

				const args = ["ffmpeg", "-i", inputPath, "-i", settings.imagePath, "-y", "-progress", "pipe:1", "-v", "quiet",
					"-filter_complex", `[0:v][1:v]overlay=${overlayStr}`,
					"-c:v", "libx264", "-crf", "23", "-c:a", "copy", outputPath];

				return executeTask(args, outputPath, info.size, info.duration, "watermark", "Watermark added");
			},

			takeScreenshot: async ({ inputPath, settings }) => {
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base } = getBasePath(inputPath);
				const timestamp = settings.timestamp;
				// Format timestamp for filename (replace : with -)
				const timeStr = new Date(timestamp * 1000).toISOString().substr(11, 8).replace(/:/g, "-");
				const outputPath = `${base}_${timeStr}.jpg`;

				// -ss before -i for fast seek
				const args = ["ffmpeg", "-ss", String(timestamp), "-i", inputPath, "-y", "-v", "quiet",
					"-vframes", "1", "-q:v", "2", outputPath];

				const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
				await proc.exited;

				// Verify output exists
				if (await Bun.file(outputPath).exists()) {
					const size = await Bun.file(outputPath).size;
					// For screenshot, we return a TaskResult but duration is 0
					return {
						outputPath,
						originalSize: info.size,
						outputSize: size,
						ratio: 0,
						toolMode: "screenshot",
						label: "Screenshot saved",
					};
				} else {
					mainWindow.webview.rpc?.send.taskError({ message: "Failed to save screenshot" });
					return null;
				}
			},

			replaceAudio: async ({ inputPath, settings }) => {
				const info = await probeVideo(inputPath);
				if (!info) { mainWindow.webview.rpc?.send.taskError({ message: "Failed to read video" }); return null; }

				const { base, ext } = getBasePath(inputPath);
				const outputPath = `${base}_newaudio${ext}`;

				// -map 0:v -map 1:a -c:v copy -shortest
				const args = ["ffmpeg", "-i", inputPath, "-i", settings.audioPath, "-y", "-progress", "pipe:1", "-v", "quiet",
					"-map", "0:v", "-map", "1:a",
					"-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", outputPath];

				return executeTask(args, outputPath, info.size, info.duration, "replace-audio", "Audio replaced");
			},
		},
		messages: {},
	},
});

// ─── Window Setup ───────────────────────────────────────────────────────

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
	frame: { width: 1300, height: 800, x: 100, y: 100 },
});

mainWindow.on("close", () => {
	if (currentProcess) currentProcess.kill();
	Utils.quit();
});

// ─── Preview File Server ────────────────────────────────────────────────
// WKWebView blocks file:// access, so serve video files via HTTP for preview
const PREVIEW_PORT = 50100;
Bun.serve({
	port: PREVIEW_PORT,
	async fetch(req) {
		const url = new URL(req.url);
		if (url.pathname !== "/preview") {
			return new Response("Not found", { status: 404 });
		}
		const filePath = url.searchParams.get("path");
		if (!filePath) return new Response("Missing path", { status: 400 });

		const file = Bun.file(filePath);
		if (!await file.exists()) return new Response("File not found", { status: 404 });

		// Support range requests for video seeking
		const rangeHeader = req.headers.get("range");
		const fileSize = file.size;

		if (rangeHeader) {
			const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
			if (match) {
				const start = parseInt(match[1]);
				const end = match[2] ? parseInt(match[2]) : fileSize - 1;
				const chunk = file.slice(start, end + 1);
				return new Response(chunk, {
					status: 206,
					headers: {
						"Content-Range": `bytes ${start}-${end}/${fileSize}`,
						"Accept-Ranges": "bytes",
						"Content-Length": String(end - start + 1),
						"Content-Type": file.type || "video/mp4",
						"Access-Control-Allow-Origin": "*",
					},
				});
			}
		}

		return new Response(file, {
			headers: {
				"Content-Type": file.type || "video/mp4",
				"Accept-Ranges": "bytes",
				"Access-Control-Allow-Origin": "*",
			},
		});
	},
});
console.log(`Preview server at http://localhost:${PREVIEW_PORT}`);

console.log("CompressX started!");
