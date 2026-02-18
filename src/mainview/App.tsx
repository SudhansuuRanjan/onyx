import { useState, useEffect, useCallback } from "react";
import { electroview, setProgressCallback, setCompleteCallback, setErrorCallback } from "./rpc";
import type {
	VideoInfo, TaskProgress, TaskResult, ToolMode,
	CompressionSettings, ConvertSettings, AudioSettings, GifSettings, MergeSettings,
	TrimSettings, CropSettings, RotateSettings, SpeedSettings, VolumeSettings, WatermarkSettings, ScreenshotSettings, ReplaceAudioSettings, AspectRatioSettings,
	PipelineSettings,
} from "../shared/types";
import { Header } from "./components/Header";
import { IdleView } from "./components/IdleView";
import { VideoPreview } from "./components/VideoPreview";
import { ToolPicker } from "./components/ToolPicker";
import { ToolSettings } from "./components/ToolSettings";
import { ProcessingView } from "./components/ProcessingView";
import { ResultView } from "./components/ResultView";
import { ErrorView } from "./components/ErrorView";

type AppState = "idle" | "selected" | "processing" | "complete" | "error";



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
	// New states
	const [trimSettings, setTrimSettings] = useState<TrimSettings>({ startTime: 0, endTime: 0 });
	const [cropSettings, setCropSettings] = useState<CropSettings>({ x: 0, y: 0, width: 0, height: 0 });
	const [rotateSettings, setRotateSettings] = useState<RotateSettings>({ angle: 0, flip: "none" });
	const [speedSettings, setSpeedSettings] = useState<SpeedSettings>({ speed: 1 });
	const [volumeSettings, setVolumeSettings] = useState<VolumeSettings>({ volume: 1 });
	const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({ mode: "image", imagePath: "", text: "", textColor: "#ffffff", fontSize: 48, position: "top-left" });
	const [screenshotSettings, setScreenshotSettings] = useState<ScreenshotSettings>({ timestamp: 0 });
	const [replaceAudioSettings, setReplaceAudioSettings] = useState<ReplaceAudioSettings>({ audioPath: "", audioFilename: "" });
	const [pipelineSettings, setPipelineSettings] = useState<PipelineSettings>({ steps: [] });

	// Initialize settings when video loads
	useEffect(() => {
		if (videoInfo) {
			setTrimSettings({ startTime: 0, endTime: videoInfo.duration });
			setCropSettings({ x: 0, y: 0, width: videoInfo.width, height: videoInfo.height });
			setScreenshotSettings({ timestamp: videoInfo.duration / 2 }); // Default to middle
		}
	}, [videoInfo]);

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

	const handleSelectImage = useCallback(async () => {
		try {
			const result = await electroview.rpc?.request.selectImage({});
			if (result) setWatermarkSettings(s => ({ ...s, imagePath: result.path }));
		} catch (e: any) { console.error("selectImage error:", e); }
	}, []);

	const handleSelectAudio = useCallback(async () => {
		try {
			const result = await electroview.rpc?.request.selectAudioFile({});
			if (result) setReplaceAudioSettings({ audioPath: result.path, audioFilename: result.filename });
		} catch (e: any) { console.error("selectAudioFile error:", e); }
	}, []);

	const handleSelectPipelineImage = useCallback(async (index: number) => {
		try {
			const result = await electroview.rpc?.request.selectImage({});
			if (result) {
				setPipelineSettings(s => {
					const newSteps = [...s.steps];
					if (newSteps[index]) {
						newSteps[index] = { ...newSteps[index], settings: { ...newSteps[index].settings, imagePath: result.path } };
					}
					return { ...s, steps: newSteps };
				});
			}
		} catch (e: any) { console.error("selectPipelineImage error:", e); }
	}, []);

	const handleSelectPipelineAudio = useCallback(async (index: number) => {
		try {
			const result = await electroview.rpc?.request.selectAudioFile({});
			if (result) {
				setPipelineSettings(s => {
					const newSteps = [...s.steps];
					if (newSteps[index]) {
						newSteps[index] = { ...newSteps[index], settings: { ...newSteps[index].settings, audioPath: result.path, audioFilename: result.filename } };
					}
					return { ...s, steps: newSteps };
				});
			}
		} catch (e: any) { console.error("selectPipelineAudio error:", e); }
	}, []);

	// Aspect Ratio Settings
	const [aspectRatioSettings, setAspectRatioSettings] = useState<AspectRatioSettings>({ ratio: "9:16", background: "blur" });

	// Helper to generate text watermark image
	const generateTextWatermark = async (settings: WatermarkSettings): Promise<string | null> => {
		try {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) return null;

			const fontSize = settings.fontSize || 48;
			const text = settings.text || "";
			const fontFamily = "system-ui, -apple-system, sans-serif";

			// Measure text
			ctx.font = `bold ${fontSize}px ${fontFamily}`;
			const metrics = ctx.measureText(text);

			// Add some padding
			const paddingX = fontSize * 0.5;
			const paddingY = fontSize * 0.5;
			canvas.width = metrics.width + paddingX * 2;
			canvas.height = fontSize * 1.5 + paddingY;

			// Clear and draw
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = settings.textColor || "#ffffff";
			ctx.font = `bold ${fontSize}px ${fontFamily}`;
			ctx.textBaseline = "middle";
			// Add shadow for better visibility
			ctx.shadowColor = "rgba(0,0,0,0.5)";
			ctx.shadowBlur = 4;
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetY = 2;

			ctx.fillText(text, paddingX, canvas.height / 2);

			const dataUrl = canvas.toDataURL("image/png");
			const path = await electroview.rpc?.request.saveTempImage({ dataUrl });
			return path || null;
		} catch (e) {
			console.error("Failed to generate text watermark:", e);
			return null;
		}
	};

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
			} else if (toolMode === "trim") {
				await electroview.rpc?.request.trimVideo({ inputPath: videoInfo.path, settings: trimSettings });
			} else if (toolMode === "crop") {
				await electroview.rpc?.request.cropVideo({ inputPath: videoInfo.path, settings: cropSettings });
			} else if (toolMode === "rotate") {
				await electroview.rpc?.request.rotateVideo({ inputPath: videoInfo.path, settings: rotateSettings });
			} else if (toolMode === "speed") {
				await electroview.rpc?.request.changeSpeed({ inputPath: videoInfo.path, settings: speedSettings });
			} else if (toolMode === "volume") {
				await electroview.rpc?.request.adjustVolume({ inputPath: videoInfo.path, settings: volumeSettings });
			} else if (toolMode === "watermark") {
				let finalSettings = { ...watermarkSettings };
				if (watermarkSettings.mode === "text") {
					const tempPath = await generateTextWatermark(watermarkSettings);
					if (!tempPath) {
						setError("Failed to generate watermark image");
						setState("error");
						return;
					}
					finalSettings.imagePath = tempPath;
				}
				if (!finalSettings.imagePath) return;
				await electroview.rpc?.request.addWatermark({ inputPath: videoInfo.path, settings: finalSettings });
			} else if (toolMode === "screenshot") {
				await electroview.rpc?.request.takeScreenshot({ inputPath: videoInfo.path, settings: screenshotSettings });
			} else if (toolMode === "replace-audio") {
				if (!replaceAudioSettings.audioPath) return;
				await electroview.rpc?.request.replaceAudio({ inputPath: videoInfo.path, settings: replaceAudioSettings });
			} else if (toolMode === "aspect-ratio") {
				await electroview.rpc?.request.convertAspectRatio({ inputPath: videoInfo.path, settings: aspectRatioSettings });
			} else if (toolMode === "pipeline") {
				if (pipelineSettings.steps.length === 0) return;

				// Pre-process steps to handle text watermarks
				const processedSteps = [];
				for (const step of pipelineSettings.steps) {
					if (step.mode === "watermark" && step.settings.mode === "text") {
						const tempPath = await generateTextWatermark(step.settings);
						if (!tempPath) {
							setError("Failed to generate watermark step image");
							setState("error");
							return;
						}
						processedSteps.push({ ...step, settings: { ...step.settings, imagePath: tempPath } });
					} else {
						processedSteps.push(step);
					}
				}

				await electroview.rpc?.request.runPipeline({ inputPath: videoInfo.path, settings: { steps: processedSteps } });
			}
		} catch (e: any) { console.error("task error:", e); }
	}, [videoInfo, toolMode, compressSettings, convertSettings, audioSettings, gifSettings, mergeSettings, trimSettings, cropSettings, rotateSettings, speedSettings, volumeSettings, watermarkSettings, screenshotSettings, replaceAudioSettings, aspectRatioSettings, pipelineSettings]);

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



	return (
		<div
			className="h-screen flex flex-col bg-primary pb-7"
			style={{
				backgroundImage:
					"radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99, 102, 241, 0.12), transparent), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(139, 92, 246, 0.06), transparent)",
			}}
		>
			<Header />

			<main className="flex-1 px-7 pt-5 pb-7 overflow-y-auto">
				{state === "idle" && <IdleView onSelectFile={handleSelectFile} />}

				{state === "selected" && videoInfo && (
					<div className="grid grid-cols-[1fr_320px] gap-4 items-start animate-fade-in">
						<div className="flex flex-col gap-3">
							<VideoPreview videoInfo={videoInfo} onReset={handleReset} />
							<ToolPicker currentMode={toolMode} setMode={setToolMode} />
						</div>

						<ToolSettings
							toolMode={toolMode}
							videoInfo={videoInfo}
							compressSettings={compressSettings} setCompressSettings={setCompressSettings}
							convertSettings={convertSettings} setConvertSettings={setConvertSettings}
							audioSettings={audioSettings} setAudioSettings={setAudioSettings}
							gifSettings={gifSettings} setGifSettings={setGifSettings}
							mergeSettings={mergeSettings} onSelectSecondFile={handleSelectSecondFile}
							trimSettings={trimSettings} setTrimSettings={setTrimSettings}
							cropSettings={cropSettings} setCropSettings={setCropSettings}
							rotateSettings={rotateSettings} setRotateSettings={setRotateSettings}
							speedSettings={speedSettings} setSpeedSettings={setSpeedSettings}
							volumeSettings={volumeSettings} setVolumeSettings={setVolumeSettings}
							watermarkSettings={watermarkSettings} setWatermarkSettings={setWatermarkSettings} onSelectImage={handleSelectImage}
							screenshotSettings={screenshotSettings} setScreenshotSettings={setScreenshotSettings}
							replaceAudioSettings={replaceAudioSettings} onSelectAudio={handleSelectAudio}
							aspectRatioSettings={aspectRatioSettings} setAspectRatioSettings={setAspectRatioSettings}

							pipelineSettings={pipelineSettings} setPipelineSettings={setPipelineSettings}
							onSelectPipelineImage={handleSelectPipelineImage} onSelectPipelineAudio={handleSelectPipelineAudio}

							startLabel={
								toolMode === "compress" ? "Start Compression" :
									toolMode === "convert" ? "Start Conversion" :
										toolMode === "audio" ? "Process Audio" :
											toolMode === "gif" ? "Create GIF" :
												toolMode === "merge" ? "Merge Videos" :
													toolMode === "trim" ? "Trim Video" :
														toolMode === "crop" ? "Crop Video" :
															toolMode === "rotate" ? "Rotate Video" :
																toolMode === "speed" ? "Change Speed" :
																	toolMode === "volume" ? "Adjust Volume" :
																		toolMode === "watermark" ? "Add Watermark" :
																			toolMode === "screenshot" ? "Save Screenshot" :
																				toolMode === "replace-audio" ? "Replace Audio" :
																					"Run Pipeline"
							}
							onStart={handleStart}
							canStart={
								(toolMode !== "merge" || !!mergeSettings.secondPath) &&
								(toolMode !== "watermark" || (watermarkSettings.mode === "text" ? !!watermarkSettings.text : !!watermarkSettings.imagePath)) &&
								(toolMode !== "replace-audio" || !!replaceAudioSettings.audioPath) &&
								(toolMode !== "pipeline" || pipelineSettings.steps.length > 0)
							}
						/>
					</div>
				)}

				{state === "processing" && <ProcessingView progress={progress} onCancel={handleCancel} />}

				{state === "complete" && result && (
					<ResultView result={result} onShowInFolder={handleShowInFolder} onGoBack={handleGoBack} onReset={handleReset} />
				)}

				{state === "error" && <ErrorView error={error} onRetry={handleGoBack} onReset={handleReset} />}
			</main>
		</div>
	);
}

export default App;
