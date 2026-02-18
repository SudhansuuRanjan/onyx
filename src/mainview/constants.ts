import { ToolMode } from "../shared/types";

export const TOOLS: { mode: ToolMode; icon: string; title: string; desc: string }[] = [
    { mode: "compress", icon: "🗜️", title: "Compress", desc: "Reduce file size" },
    { mode: "convert", icon: "🔄", title: "Convert", desc: "Change format" },
    { mode: "trim", icon: "✂️", title: "Trim", desc: "Cut video clip" },
    { mode: "crop", icon: "📐", title: "Crop", desc: "Resize dimensions" },
    { mode: "rotate", icon: "↷", title: "Rotate", desc: "Flip or rotate" },
    { mode: "audio", icon: "🎵", title: "Audio", desc: "Extract/Strip" },
    { mode: "speed", icon: "🚀", title: "Speed", desc: "Adjust playback" },
    { mode: "volume", icon: "🔊", title: "Volume", desc: "Boost/Reduce" },
    { mode: "watermark", icon: "💧", title: "Watermark", desc: "Add overlay" },
    { mode: "gif", icon: "🎞️", title: "GIF", desc: "Create GIF" },
    { mode: "screenshot", icon: "📸", title: "Snapshot", desc: "Save frame" },
    { mode: "merge", icon: "🔗", title: "Merge", desc: "Join videos" },
    { mode: "replace-audio", icon: "🎧", title: "Replace Audio", desc: "Swap track" },
    { mode: "aspect-ratio", icon: "📱", title: "Aspect Ratio", desc: "Resize for social" },
    { mode: "pipeline", icon: "⚡", title: "Pipeline", desc: "Chain tools" },
];

export const FEATURES = [
    { icon: "🗜️", title: "Smart Compression", desc: "Reduce file size maintaining quality" },
    { icon: "🔄", title: "Universal Converter", desc: "Convert between all major video formats" },
    { icon: "⚡", title: "Pipeline Workflow", desc: "Chain operations into powerful recipes" },
    { icon: "✨", title: "Visual Studio", desc: "Trim, Crop, Rotate, Speed, Aspect Ratio" },
    { icon: "🎵", title: "Audio Studio", desc: "Extract, Strip, Replace, Boost Volume" },
    { icon: "🛠️", title: "Creative Tools", desc: "Watermark, GIF, Screenshot, Merge, Reverse" },
];
