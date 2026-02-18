import { useState, useEffect, useCallback } from "react";
import { electroview, setProgressCallback, setCompleteCallback, setErrorCallback } from "./rpc";
import type { VideoInfo, CompressionProgress, CompressionResult, CompressionSettings } from "../shared/types";

type AppState = "idle" | "selected" | "compressing" | "complete" | "error";

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

function App() {
	const [state, setState] = useState<AppState>("idle");
	const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
	const [progress, setProgress] = useState<CompressionProgress>({ percentage: 0, speed: "", eta: "", currentTime: 0 });
	const [result, setResult] = useState<CompressionResult | null>(null);
	const [error, setError] = useState("");
	const [settings, setSettings] = useState<CompressionSettings>({ quality: "medium", resolution: "original" });

	useEffect(() => {
		setProgressCallback((p) => setProgress(p));
		setCompleteCallback((r) => { setResult(r); setState("complete"); });
		setErrorCallback((msg) => { setError(msg); setState("error"); });
	}, []);

	const handleSelectFile = useCallback(async () => {
		try {
			const info = await electroview.rpc?.request.selectFile({});
			if (info) {
				setVideoInfo(info);
				setState("selected");
				setError("");
			}
		} catch (e: any) {
			console.error("selectFile error:", e);
		}
	}, []);

	const handleCompress = useCallback(async () => {
		if (!videoInfo) return;
		setState("compressing");
		setProgress({ percentage: 0, speed: "", eta: "", currentTime: 0 });
		setResult(null);

		try {
			await electroview.rpc?.request.compressVideo({
				inputPath: videoInfo.path,
				settings,
			});
		} catch (e: any) {
			console.error("compress error:", e);
		}
	}, [videoInfo, settings]);

	const handleCancel = useCallback(async () => {
		await electroview.rpc?.request.cancelCompression({});
		setState("selected");
		setProgress({ percentage: 0, speed: "", eta: "", currentTime: 0 });
	}, []);

	const handleShowInFolder = useCallback(async () => {
		if (result) {
			await electroview.rpc?.request.showInFolder({ path: result.outputPath });
		}
	}, [result]);

	const handleReset = useCallback(() => {
		setState("idle");
		setVideoInfo(null);
		setProgress({ percentage: 0, speed: "", eta: "", currentTime: 0 });
		setResult(null);
		setError("");
	}, []);

	return (
		<div className="app-container">
			<header className="app-header">
				<div className="header-content">
					<div className="logo">
						<div className="logo-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<polygon points="23 7 16 12 23 17 23 7" />
								<rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
							</svg>
						</div>
						<h1>CompressX</h1>
					</div>
					<p className="tagline">Fast video compression powered by ffmpeg</p>
				</div>
			</header>

			<main className="main-content">
				{state === "idle" && (
					<div className="card drop-zone animate-fade-in" onClick={handleSelectFile}>
						<div className="drop-zone-content">
							<div className="drop-icon">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="17 8 12 3 7 8" />
									<line x1="12" y1="3" x2="12" y2="15" />
								</svg>
							</div>
							<h2>Select a Video File</h2>
							<p>Click to browse for a video file</p>
							<p className="supported-formats">MP4, MOV, AVI, MKV, WebM, FLV, WMV</p>
						</div>
					</div>
				)}

				{state === "selected" && videoInfo && (
					<div className="animate-fade-in">
						<div className="card file-info-card">
							<div className="card-header">
								<h3>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon">
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
										<polyline points="14 2 14 8 20 8" />
									</svg>
									{videoInfo.filename}
								</h3>
								<button className="btn-ghost" onClick={handleReset}>Change</button>
							</div>
							<div className="file-meta">
								<div className="meta-item">
									<span className="meta-label">Size</span>
									<span className="meta-value">{formatBytes(videoInfo.size)}</span>
								</div>
								<div className="meta-item">
									<span className="meta-label">Resolution</span>
									<span className="meta-value">{videoInfo.width}×{videoInfo.height}</span>
								</div>
								<div className="meta-item">
									<span className="meta-label">Duration</span>
									<span className="meta-value">{formatDuration(videoInfo.duration)}</span>
								</div>
								<div className="meta-item">
									<span className="meta-label">Codec</span>
									<span className="meta-value">{videoInfo.codec.toUpperCase()}</span>
								</div>
							</div>
						</div>

						<div className="card settings-card">
							<h3>Compression Settings</h3>
							<div className="setting-group">
								<label className="setting-label">Quality</label>
								<div className="quality-options">
									{(["high", "medium", "low"] as const).map((q) => (
										<button key={q} className={`quality-btn ${settings.quality === q ? "active" : ""}`} onClick={() => setSettings((s) => ({ ...s, quality: q }))}>
											<span className="quality-name">{q.charAt(0).toUpperCase() + q.slice(1)}</span>
											<span className="quality-desc">
												{q === "high" && "Best quality, larger file"}
												{q === "medium" && "Good balance"}
												{q === "low" && "Smallest file"}
											</span>
										</button>
									))}
								</div>
							</div>
							<div className="setting-group">
								<label className="setting-label">Resolution</label>
								<div className="resolution-options">
									{([
										{ value: "original", label: "Original" },
										{ value: "1080p", label: "1080p" },
										{ value: "720p", label: "720p" },
										{ value: "480p", label: "480p" },
									] as const).map((r) => (
										<button key={r.value} className={`resolution-btn ${settings.resolution === r.value ? "active" : ""}`} onClick={() => setSettings((s) => ({ ...s, resolution: r.value }))}>
											{r.label}
										</button>
									))}
								</div>
							</div>
						</div>

						<button className="btn-primary compress-btn" onClick={handleCompress}>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon">
								<polyline points="4 14 10 14 10 20" />
								<polyline points="20 10 14 10 14 4" />
								<line x1="14" y1="10" x2="21" y2="3" />
								<line x1="3" y1="21" x2="10" y2="14" />
							</svg>
							Start Compression
						</button>
					</div>
				)}

				{state === "compressing" && (
					<div className="card progress-card animate-fade-in">
						<h3>Compressing...</h3>
						<div className="progress-bar-container">
							<div className="progress-bar" style={{ width: `${progress.percentage}%` }}>
								<div className="progress-glow" />
							</div>
						</div>
						<div className="progress-info">
							<span className="progress-percentage">{progress.percentage}%</span>
							<div className="progress-details">
								{progress.speed && <span>Speed: {progress.speed}</span>}
								{progress.eta && <span>ETA: {progress.eta}</span>}
							</div>
						</div>
						<button className="btn-danger cancel-btn" onClick={handleCancel}>Cancel</button>
					</div>
				)}

				{state === "complete" && result && (
					<div className="card result-card animate-fade-in">
						<div className="result-header">
							<div className="success-icon">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
									<polyline points="22 4 12 14.01 9 11.01" />
								</svg>
							</div>
							<h3>Compression Complete!</h3>
						</div>
						<div className="result-comparison">
							<div className="size-block original">
								<span className="size-label">Original</span>
								<span className="size-value">{formatBytes(result.originalSize)}</span>
							</div>
							<div className="size-arrow">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<line x1="5" y1="12" x2="19" y2="12" />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</div>
							<div className="size-block compressed">
								<span className="size-label">Compressed</span>
								<span className="size-value">{formatBytes(result.compressedSize)}</span>
							</div>
						</div>
						<div className="savings-badge">Saved {result.ratio}%</div>
						<div className="result-actions">
							<button className="btn-primary" onClick={handleShowInFolder}>Show in Folder</button>
							<button className="btn-secondary" onClick={handleReset}>Compress Another</button>
						</div>
					</div>
				)}

				{state === "error" && (
					<div className="card error-card animate-fade-in">
						<div className="error-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="12" r="10" />
								<line x1="15" y1="9" x2="9" y2="15" />
								<line x1="9" y1="9" x2="15" y2="15" />
							</svg>
						</div>
						<h3>Compression Failed</h3>
						<p className="error-message">{error}</p>
						<button className="btn-secondary" onClick={handleReset}>Try Again</button>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
