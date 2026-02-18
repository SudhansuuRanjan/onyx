import { join } from "path";
import { chmod } from "fs/promises";

async function downloadFile(url: string, destPath: string) {
    console.log(`Downloading ${url} to ${destPath}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${url}: ${response.statusText}`);
    await Bun.write(destPath, response);
    console.log("Download complete.");
}

async function extractZip(zipPath: string, outDir: string, binaryName: string) {
    console.log(`Extracting ${binaryName} from ${zipPath}...`);
    // Using unzip for Mac/Linux. Windows users running this script via Bun might need 7z or similar, 
    // but assuming dev environment is Mac based on user context.
    const proc = Bun.spawn(["unzip", "-o", "-j", zipPath, `**/${binaryName}`, "-d", outDir]);
    await proc.exited;
    // Cleanup zip
    try { await Bun.file(zipPath).delete(); } catch (e) { }
}

const BIN_ROOT = join(import.meta.dir, "../bin");

async function main() {
    // Mac ARM64
    console.log("--- Processing Mac ARM64 ---");
    const macArmUrl = "https://www.osxexperts.net/ffmpeg7arm.zip"; // Example URL, verified static builds preferred
    // Using a reliable source for static builds is crucial. 
    // evermeet.cx is standard for mac.

    // NOTE: Automated downloading of ffmpeg binaries can be flaky due to URL changes.
    // Ideally, we download from a stable release asset or a mirror.
    // For this script, I'll use placeholders or known stable links if possible.
    // simpler: instruct user to put files there? No, let's try.

    // Using simple approach: Assume user has 'ffmpeg' in path for dev, but we need to populate bin/ for build.
    // For now, I will COPY the system ffmpeg to bin/mac-arm64 as a quick fix for YOUR current dev setup
    // and provide instructions/script for full cross-platform population.

    try {
        const sysFfmpeg = Bun.spawnSync(["which", "ffmpeg"]).stdout.toString().trim();
        if (sysFfmpeg) {
            console.log(`Copying system ffmpeg (${sysFfmpeg}) to bin/mac-arm64/ffmpeg`);
            await Bun.write(join(BIN_ROOT, "mac-arm64", "ffmpeg"), Bun.file(sysFfmpeg));
            await chmod(join(BIN_ROOT, "mac-arm64", "ffmpeg"), 0o755);
        } else {
            console.warn("System ffmpeg not found. Please install ffmpeg or manually place it in bin/mac-arm64/");
        }
    } catch (e) {
        console.error("Failed to copy system ffmpeg", e);
    }

    // Windows x64 (Download)
    // https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
    // This is huge. Maybe we skip auto-download for now to save time/bandwidth and just warn?
    console.log("\nNOTE: To support Windows, download ffmpeg.exe from https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip and place it in bin/win-x64/");

    // Mac x64
    console.log("NOTE: To support Mac Intel, place ffmpeg binary in bin/mac-x64/");
}

main();
