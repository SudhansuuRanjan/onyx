import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "Onyx",
		identifier: "onyx.electrobun.dev",
		version: "1.0.0",
	},
	build: {
		// Vite builds to dist/, we copy from there
		copy: {
			"dist/index.html": "views/mainview/index.html",
			"dist/assets": "views/mainview/assets",
			"bin": "bin",
		},
		mac: {
			bundleCEF: false,
			codesign: true,
			notarize: true,
			icons: "public/icon.iconset",
		},
		linux: {
			bundleCEF: false,
			icon: "public/icon.png",
		},
		win: {
			bundleCEF: false,
			icon: "public/icon.ico",
		},
	},
} satisfies ElectrobunConfig;
