import { useState, useEffect, useCallback } from "react";
import { electroview, setProgressCallback, setCompleteCallback, setErrorCallback } from "./rpc";
import type {
	VideoInfo, TaskProgress, TaskResult, ToolMode,
	CompressionSettings, ConvertSettings, AudioSettings, AudioAction, AudioFormat, GifSettings, MergeSettings,
} from "../shared/types";

type AppState = "idle" | "selected" | "processing" | "complete" | "error";

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	return `${m}:${String(s).padStart(2, "0")}`;
}

const TOOLS: { mode: ToolMode; icon: string; title: string; desc: string }[] = [
	{ mode: "compress", icon: "🗜️", title: "Compress", desc: "Reduce file size" },
	{ mode: "convert", icon: "🔄", title: "Convert", desc: "Change format" },
	{ mode: "audio", icon: "🎵", title: "Audio", desc: "Extract, strip, or mute" },
	{ mode: "gif", icon: "🎞️", title: "GIF", desc: "Create animated GIF" },
	{ mode: "merge", icon: "🔗", title: "Merge", desc: "Join two videos" },
];

const FEATURES = [
	{ icon: "🗜️", title: "Compress", desc: "Reduce video file size with customizable quality" },
	{ icon: "🔄", title: "Convert", desc: "MP4, MKV, AVI, WebM, MOV formats" },
	{ icon: "🎵", title: "Audio Tools", desc: "Extract, strip, or mute audio tracks" },
	{ icon: "🎞️", title: "GIF Maker", desc: "Create animated GIFs with custom FPS" },
	{ icon: "🔗", title: "Merge", desc: "Combine two videos into one" },
	{ icon: "⚡", title: "Fast", desc: "Powered by FFmpeg for blazing speed" },
];

function App() {
	const [state, setState] = useState<AppState>("idle");
	const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
	const [toolMode, setToolMode] = useState<ToolMode>("compress");
	const [progress, setProgress] = useState<TaskProgress>({ percentage: 0, speed: "", eta: "", currentTime: 0 });
	const [result, setResult] = useState<TaskResult | null>(null);
	const [error, setError] = useState("");

	// Per-tool settings
	const [compressSettings, setCompressSettings] = useState<CompressionSettings>({ quality: "medium", resolution: "original" });
	const [convertSettings, setConvertSettings] = useState<ConvertSettings>({ format: "mkv" });
	const [audioSettings, setAudioSettings] = useState<AudioSettings>({ action: "extract", outputFormat: "mp3" });
	const [gifSettings, setGifSettings] = useState<GifSettings>({ fps: 15, width: 480 });
	const [mergeSettings, setMergeSettings] = useState<MergeSettings>({ secondPath: "", secondFilename: "" });

	useEffect(() => {
		setProgressCallback((p) => setProgress(p));
		setCompleteCallback((r) => { setResult(r); setState("complete"); });
		setErrorCallback((msg) => { setError(msg); setState("error"); });
	}, []);

	const handleSelectFile = useCallback(async () => {
		try {
			const info = await electroview.rpc?.request.selectFile({});
			if (info) { setVideoInfo(info); setState("selected"); setError(""); }
		} catch (e: any) { console.error("selectFile error:", e); }
	}, []);

	const handleSelectSecondFile = useCallback(async () => {
		try {
			const result = await electroview.rpc?.request.selectSecondFile({});
			if (result) setMergeSettings({ secondPath: result.path, secondFilename: result.filename });
		} catch (e: any) { console.error("selectSecondFile error:", e); }
	}, []);

	const handleStart = useCallback(async () => {
		if (!videoInfo) return;
		setState("processing");
		setProgress({ percentage: 0, speed: "", eta: "", currentTime: 0 });
		setResult(null);

		try {
			if (toolMode === "compress") {
				await electroview.rpc?.request.compressVideo({ inputPath: videoInfo.path, settings: compressSettings });
			} else if (toolMode === "convert") {
				await electroview.rpc?.request.convertVideo({ inputPath: videoInfo.path, settings: convertSettings });
			} else if (toolMode === "audio") {
				await electroview.rpc?.request.processAudio({ inputPath: videoInfo.path, settings: audioSettings });
			} else if (toolMode === "gif") {
				await electroview.rpc?.request.makeGif({ inputPath: videoInfo.path, settings: gifSettings });
			} else if (toolMode === "merge") {
				if (!mergeSettings.secondPath) return;
				await electroview.rpc?.request.mergeVideos({ inputPath: videoInfo.path, settings: mergeSettings });
			}
		} catch (e: any) { console.error("task error:", e); }
	}, [videoInfo, toolMode, compressSettings, convertSettings, audioSettings, gifSettings, mergeSettings]);

	const handleCancel = useCallback(async () => {
		await electroview.rpc?.request.cancelTask({});
		setState("selected");
		setProgress({ percentage: 0, speed: "", eta: "", currentTime: 0 });
	}, []);

	const handleShowInFolder = useCallback(async () => {
		if (result) await electroview.rpc?.request.showInFolder({ path: result.outputPath });
	}, [result]);

	const handleReset = useCallback(() => {
		setState("idle");
		setVideoInfo(null);
		setProgress({ percentage: 0, speed: "", eta: "", currentTime: 0 });
		setResult(null);
		setError("");
	}, []);

	// Go back to selected state, keeping the video
	const handleGoBack = useCallback(() => {
		setState("selected");
		setProgress({ percentage: 0, speed: "", eta: "", currentTime: 0 });
		setResult(null);
		setError("");
	}, []);

	const startLabel = toolMode === "compress" ? "Start Compression"
		: toolMode === "convert" ? "Start Conversion"
			: toolMode === "audio" ? "Process Audio"
				: toolMode === "gif" ? "Create GIF"
					: "Merge Videos";

	const canStart = toolMode !== "merge" || !!mergeSettings.secondPath;

	return (
		<div
			className="h-screen flex flex-col bg-primary pb-7"
			style={{
				backgroundImage:
					"radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99, 102, 241, 0.12), transparent), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(139, 92, 246, 0.06), transparent)",
			}}
		>
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

			<main className="flex-1 px-7 pt-5 pb-7 overflow-y-auto">
				{/* ── Idle: File Selection ── */}
				{state === "idle" && (
					<div className="animate-fade-in">
						<div
							className="bg-card border-default rounded-xl p-6 mb-4 backdrop-blur-xl transition-all duration-200 flex justify-center items-center min-h-[320px] cursor-pointer border-2 border-dashed border-default hover:border-accent hover:bg-accent-subtle"
							onClick={handleSelectFile}
						>
							<div className="text-center">
								<div className="w-14 h-14 text-t-muted mx-auto mb-5 transition-all duration-200 hover:text-accent hover:-translate-y-1">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
										<polyline points="17 8 12 3 7 8" />
										<line x1="12" y1="3" x2="12" y2="15" />
									</svg>
								</div>
								<h2 className="text-xl font-semibold text-t-primary mb-1.5">Select a Video File</h2>
								<p className="text-t-secondary text-sm">Click to browse for a video file</p>
								<p className="mt-4 text-xs text-t-muted py-2 px-4 bg-white/[0.03] rounded-[20px] inline-block">MP4, MOV, AVI, MKV, WebM, FLV, WMV</p>
							</div>
						</div>

						{/* Feature showcase */}
						<div className="grid grid-cols-3 gap-3 mt-4">
							{FEATURES.map((f) => (
								<div key={f.title} className="flex items-center gap-3 py-3.5 px-4 bg-white/[0.03] border border-white/[0.06] rounded-xl transition-all duration-200 hover:bg-white/[0.06] hover:border-white/10">
									<span className="text-[1.4rem] flex-shrink-0">{f.icon}</span>
									<div>
										<span className="block text-[0.85rem] font-semibold text-t-primary">{f.title}</span>
										<span className="block text-[0.75rem] text-t-muted mt-0.5">{f.desc}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* ── Selected: Two-column layout ── */}
				{state === "selected" && videoInfo && (
					<div className="grid grid-cols-[1fr_320px] gap-4 items-start animate-fade-in">
						{/* Left column: preview + info + tool picker */}
						<div className="flex flex-col gap-3">
							<div className="bg-card border border-default rounded-xl backdrop-blur-xl p-0 overflow-hidden bg-black mb-4">
								<video
									src={`http://localhost:50100/preview?path=${encodeURIComponent(videoInfo.path)}`}
									controls
									autoPlay
									muted
									loop
									preload="auto"
									className="w-full max-h-[320px] block object-contain rounded-xl"
								/>
							</div>

							<div className="bg-card border border-default rounded-xl p-6 mb-4 backdrop-blur-xl">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-sm font-semibold text-t-primary flex items-center gap-2 mb-0 overflow-hidden text-ellipsis whitespace-nowrap max-w-[80%]">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
											<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
											<polyline points="14 2 14 8 20 8" />
										</svg>
										{videoInfo.filename}
									</h3>
									<button className="bg-transparent border-none text-accent text-[13px] font-medium cursor-pointer py-1 px-2 rounded-md transition-all duration-200 hover:bg-accent-subtle" onClick={handleReset}>Change File</button>
								</div>
								<div className="grid grid-cols-5 gap-3">
									<div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Size</span><span className="block text-[15px] font-semibold text-t-primary">{formatBytes(videoInfo.size)}</span></div>
									<div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Resolution</span><span className="block text-[15px] font-semibold text-t-primary">{videoInfo.width}×{videoInfo.height}</span></div>
									<div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Duration</span><span className="block text-[15px] font-semibold text-t-primary">{formatDuration(videoInfo.duration)}</span></div>
									<div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Codec</span><span className="block text-[15px] font-semibold text-t-primary">{videoInfo.codec.toUpperCase()}</span></div>
									<div className="bg-white/[0.03] rounded-lg p-3 text-center"><span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Audio</span><span className="block text-[15px] font-semibold text-t-primary">{videoInfo.hasAudio ? "Yes" : "No audio"}</span></div>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-2.5 mb-4">
								{TOOLS.map((t) => (
									<button
										key={t.mode}
										className={`flex flex-col items-center gap-1 py-4 px-3 border rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-[12px] ${toolMode === t.mode
												? "bg-accent-subtle border-accent text-t-primary shadow-[0_0_20px_rgba(99,102,241,0.4)]"
												: "bg-card border-default text-t-secondary hover:bg-card-hover hover:border-default-hover hover:text-t-primary hover:-translate-y-px"
											}`}
										onClick={() => setToolMode(t.mode)}
									>
										<span className="text-[1.6rem] leading-none">{t.icon}</span>
										<span className="text-[0.95rem] font-semibold tracking-[0.01em]">{t.title}</span>
										<span className={`text-[0.72rem] text-center ${toolMode === t.mode ? "text-t-secondary" : "text-t-muted"}`}>{t.desc}</span>
									</button>
								))}
							</div>
						</div>

						{/* Right sidebar: settings + start */}
						<div className="flex flex-col gap-3 sticky top-4">
							<div className="bg-card border border-default rounded-xl p-6 backdrop-blur-xl">
								<h3 className="text-[15px] font-semibold text-t-primary mb-4 flex items-center gap-2">{TOOLS.find(t => t.mode === toolMode)?.title} Settings</h3>

								{toolMode === "compress" && (
									<>
										<div className="mb-5">
											<label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Quality</label>
											<div className="flex flex-col gap-2.5">
												{(["high", "medium", "low"] as const).map((q) => (
													<button
														key={q}
														className={`w-full border rounded-lg py-3.5 px-3 cursor-pointer transition-all duration-200 text-center text-t-primary ${compressSettings.quality === q
																? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
																: "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
															}`}
														onClick={() => setCompressSettings(s => ({ ...s, quality: q }))}
													>
														<span className="block font-semibold text-sm mb-0.5">{q.charAt(0).toUpperCase() + q.slice(1)}</span>
														<span className={`block text-[11px] ${compressSettings.quality === q ? "text-accent-hover" : "text-t-muted"}`}>
															{q === "high" && "Best quality"}
															{q === "medium" && "Balanced"}
															{q === "low" && "Smallest"}
														</span>
													</button>
												))}
											</div>
										</div>
										<div>
											<label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Resolution</label>
											<div className="flex flex-col gap-2">
												{([
													{ value: "original", label: "Original" },
													{ value: "1080p", label: "1080p" },
													{ value: "720p", label: "720p" },
													{ value: "480p", label: "480p" },
												] as const).map((r) => (
													<button
														key={r.value}
														className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${compressSettings.resolution === r.value
																? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
																: "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
															}`}
														onClick={() => setCompressSettings(s => ({ ...s, resolution: r.value }))}
													>
														{r.label}
													</button>
												))}
											</div>
										</div>
									</>
								)}

								{toolMode === "convert" && (
									<div>
										<label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Target Format</label>
										<div className="flex flex-col gap-2">
											{(["mp4", "mkv", "avi", "webm", "mov"] as const).map((f) => (
												<button
													key={f}
													className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${convertSettings.format === f
															? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
															: "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
														}`}
													onClick={() => setConvertSettings({ format: f })}
												>
													{f.toUpperCase()}
												</button>
											))}
										</div>
									</div>
								)}

								{toolMode === "audio" && (
									<>
										<div className="mb-5">
											<label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Action</label>
											<div className="flex flex-col gap-2.5">
												{([
													{ value: "extract", name: "Extract", desc: "Save audio separately" },
													{ value: "strip", name: "Strip", desc: "Remove audio" },
													{ value: "mute", name: "Mute", desc: "Silence audio" },
												] as const).map((a) => (
													<button
														key={a.value}
														className={`w-full border rounded-lg py-3.5 px-3 cursor-pointer transition-all duration-200 text-center text-t-primary ${audioSettings.action === a.value
																? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
																: "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
															}`}
														onClick={() => setAudioSettings(s => ({ ...s, action: a.value as AudioAction }))}
													>
														<span className="block font-semibold text-sm mb-0.5">{a.name}</span>
														<span className={`block text-[11px] ${audioSettings.action === a.value ? "text-accent-hover" : "text-t-muted"}`}>{a.desc}</span>
													</button>
												))}
											</div>
										</div>
										{audioSettings.action === "extract" && (
											<div>
												<label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Output Format</label>
												<div className="flex flex-col gap-2">
													{(["mp3", "aac", "wav"] as const).map((f) => (
														<button
															key={f}
															className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${audioSettings.outputFormat === f
																	? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
																	: "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
																}`}
															onClick={() => setAudioSettings(s => ({ ...s, outputFormat: f as AudioFormat }))}
														>
															{f.toUpperCase()}
														</button>
													))}
												</div>
											</div>
										)}
									</>
								)}

								{toolMode === "gif" && (
									<>
										<div className="mb-5">
											<label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Frame Rate</label>
											<div className="flex flex-col gap-2">
												{([10, 15, 24] as const).map((f) => (
													<button
														key={f}
														className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${gifSettings.fps === f
																? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
																: "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
															}`}
														onClick={() => setGifSettings(s => ({ ...s, fps: f }))}
													>
														{f} FPS
													</button>
												))}
											</div>
										</div>
										<div>
											<label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Width</label>
											<div className="flex flex-col gap-2">
												{([
													{ value: 0, label: "Original" },
													{ value: 640, label: "640px" },
													{ value: 480, label: "480px" },
													{ value: 320, label: "320px" },
												] as const).map((w) => (
													<button
														key={w.value}
														className={`w-full border rounded-lg py-2.5 cursor-pointer transition-all duration-200 text-center font-medium text-[13px] text-t-primary ${gifSettings.width === w.value
																? "border-accent bg-accent-subtle shadow-[0_0_0_1px_#6366f1]"
																: "bg-white/[0.03] border-default hover:border-default-hover hover:bg-card-hover"
															}`}
														onClick={() => setGifSettings(s => ({ ...s, width: w.value as GifSettings["width"] }))}
													>
														{w.label}
													</button>
												))}
											</div>
										</div>
									</>
								)}

								{toolMode === "merge" && (
									<div>
										<label className="block text-xs font-semibold uppercase tracking-[0.06em] text-t-muted mb-2.5">Second Video</label>
										{mergeSettings.secondPath ? (
											<div className="flex items-center justify-between gap-2 py-2.5 px-3 bg-white/[0.04] rounded-lg border border-white/[0.08]">
												<span className="text-[0.85rem] text-t-primary overflow-hidden text-ellipsis whitespace-nowrap">📄 {mergeSettings.secondFilename}</span>
												<button className="bg-transparent border-none text-accent text-[13px] font-medium cursor-pointer py-1 px-2 rounded-md transition-all duration-200 hover:bg-accent-subtle" onClick={handleSelectSecondFile}>Change</button>
											</div>
										) : (
											<button
												className="w-full text-center inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-white/[0.06] text-t-primary font-semibold text-sm border border-default rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-default-hover"
												onClick={handleSelectSecondFile}
											>
												📂 Select Second Video
											</button>
										)}
										<p className="text-[0.75rem] text-t-muted mt-2">Videos will be joined end-to-end</p>
									</div>
								)}
							</div>

							<button
								className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-accent text-white font-semibold text-sm border-none rounded-lg cursor-pointer transition-all duration-200 shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:bg-accent-hover hover:shadow-[0_6px_24px_rgba(99,102,241,0.4)] hover:-translate-y-px ${!canStart ? "opacity-50 cursor-not-allowed" : ""}`}
								onClick={handleStart}
								disabled={!canStart}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
									<polygon points="5 3 19 12 5 21 5 3" />
								</svg>
								{startLabel}
							</button>
						</div>
					</div>
				)}

				{/* ── Processing ── */}
				{state === "processing" && (
					<div className="bg-card border border-default rounded-xl p-10 backdrop-blur-xl text-center animate-fade-in">
						<h3 className="text-lg font-semibold text-t-primary mb-7 flex items-center justify-center gap-2">Processing...</h3>
						<div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-5">
							<div className="h-full bg-gradient-to-r from-accent to-[#a78bfa] rounded-full transition-[width] duration-300 ease-out relative" style={{ width: `${progress.percentage}%` }}>
								<div className="absolute -top-0.5 right-0 w-10 h-3 bg-accent-glow rounded-full blur-[8px] animate-pulse" />
							</div>
						</div>
						<div className="flex justify-between items-center mb-6">
							<span className="text-[32px] font-bold bg-gradient-to-br from-accent to-[#a78bfa] bg-clip-text text-transparent">{progress.percentage}%</span>
							<div className="flex gap-5 text-[13px] text-t-secondary">
								{progress.speed && <span>Speed: {progress.speed}</span>}
								{progress.eta && <span>ETA: {progress.eta}</span>}
							</div>
						</div>
						<button
							className="mt-1 inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-transparent text-danger font-semibold text-[13px] border border-danger/30 rounded-lg cursor-pointer transition-all duration-200 hover:bg-danger/10 hover:border-danger"
							onClick={handleCancel}
						>
							Cancel
						</button>
					</div>
				)}

				{/* ── Complete ── */}
				{state === "complete" && result && (
					<div className="bg-card border border-default rounded-xl py-9 px-8 backdrop-blur-xl text-center animate-fade-in">
						<div className="mb-7">
							<div className="w-12 h-12 text-success mx-auto mb-3 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-check-pop">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
									<polyline points="22 4 12 14.01 9 11.01" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-t-primary flex items-center justify-center gap-2">{result.label}!</h3>
						</div>
						<div className="flex items-center justify-center gap-5 mb-5">
							<div className="bg-white/[0.03] rounded-lg py-4 px-7 min-w-[140px]">
								<span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Original</span>
								<span className="block text-xl font-bold text-t-secondary">{formatBytes(result.originalSize)}</span>
							</div>
							<div className="w-6 h-6 text-t-muted">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<line x1="5" y1="12" x2="19" y2="12" />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</div>
							<div className="bg-white/[0.03] rounded-lg py-4 px-7 min-w-[140px]">
								<span className="block text-[11px] font-medium uppercase tracking-wider text-t-muted mb-1">Output</span>
								<span className="block text-xl font-bold text-success">{formatBytes(result.outputSize)}</span>
							</div>
						</div>
						{result.ratio > 0 && <div className="inline-block py-2 px-5 bg-success/10 text-success font-bold text-[15px] rounded-full border border-success/20 mb-6">Saved {result.ratio}%</div>}
						{result.ratio <= 0 && <div className="inline-block py-2 px-5 bg-white/[0.08] text-t-secondary font-bold text-[15px] rounded-full border border-white/[0.08] mb-6 shadow-none">Size {Math.abs(result.ratio)}% {result.ratio === 0 ? "unchanged" : "larger"}</div>}
						<div className="flex gap-3 justify-center">
							<button className="inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-accent text-white font-semibold text-sm border-none rounded-lg cursor-pointer transition-all duration-200 shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:bg-accent-hover hover:shadow-[0_6px_24px_rgba(99,102,241,0.4)] hover:-translate-y-px" onClick={handleShowInFolder}>Show in Folder</button>
							<button className="inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-white/[0.06] text-t-primary font-semibold text-sm border border-default rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-default-hover" onClick={handleGoBack}>Process Again</button>
							<button className="bg-transparent border-none text-accent text-[13px] font-medium cursor-pointer py-1 px-2 rounded-md transition-all duration-200 hover:bg-accent-subtle" onClick={handleReset}>New File</button>
						</div>
					</div>
				)}

				{/* ── Error ── */}
				{state === "error" && (
					<div className="bg-card border border-default rounded-xl py-10 px-8 backdrop-blur-xl text-center animate-fade-in">
						<div className="w-12 h-12 text-danger mx-auto mb-3">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="12" r="10" />
								<line x1="15" y1="9" x2="9" y2="15" />
								<line x1="9" y1="9" x2="15" y2="15" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-danger flex items-center justify-center gap-2 mb-4">Task Failed</h3>
						<p className="text-t-secondary text-[13px] mb-5 max-h-[120px] overflow-y-auto break-words p-3 bg-danger/5 rounded-lg">{error}</p>
						<div className="flex gap-3 justify-center">
							<button className="inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-white/[0.06] text-t-primary font-semibold text-sm border border-default rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-default-hover" onClick={handleGoBack}>Try Again</button>
							<button className="bg-transparent border-none text-accent text-[13px] font-medium cursor-pointer py-1 px-2 rounded-md transition-all duration-200 hover:bg-accent-subtle" onClick={handleReset}>New File</button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
