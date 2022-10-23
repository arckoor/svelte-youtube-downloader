<script lang="ts">
	import { onMount } from "svelte";
	import { dlToFile, convertFileToBuffer } from "@/util";
	import { tIL, language } from "@/localise";
	import coverData from "@/assets/cover.png?raw-hex";
	import noCover from "@/assets/no-cover.png";
	import ID3Writer from "browser-id3-writer";
	import MP3Tag from "mp3tag.js";

	const lang = tIL[language];
	const tagLang = [[lang.title, lang.artist], [lang.album, lang.genre], [lang.year, lang.track]];
	const cover = Uint8ArrayToImage(Uint8Array.from(coverData.match(/.{1,2}/g).map((x: string) => parseInt(x, 16))), "image/png");
	export let file: File;
	export let moreAvailable: Boolean;
	export let triggerNext: Function;
	export let fromLink: Boolean;

	let mp3tag: typeof MP3Tag;
	let fileName = file.name;
	let cfBuffer: string;
	let cf: string;
	let usePresetCover = false;
	let fileHadCover = false;
	let coverAvailable = false;
	let tagsInavlid = false;
	let errorMessage = "";

	let tags = {
		title: "",
		artist: "",
		album: "",
		genre: "",
		year: "",
		track: ""
	};

	const assignToVar = (e: Event, key: string) => tags[key] = (e.target as HTMLInputElement).value;
	const assignCheckboxVal = () => {
		usePresetCover = !usePresetCover;
		updateCover();
	};

	onMount(async () => {
		if (!fromLink) fileName = fileName.replace(/\.[^/.]+$/, "");

		mp3tag = new MP3Tag(await fileToArrayBuffer(file));
		mp3tag.read();
		if (mp3tag) {
			tags.title = mp3tag.title || (fileName || "");
			tags.artist = mp3tag.artist || "";
			tags.album = (mp3tag.album || "").replace(/\\\\/g, "/");
			tags.genre = mp3tag.genre || "";
			tags.year = mp3tag.year || "";
			tags.track = mp3tag.track || "" ;
			if (mp3tag.tags.v2) {
				if (mp3tag.tags.v2.APIC && mp3tag.tags.v2.APIC.length > 0) {
					const image = mp3tag.tags.v2.APIC[0];
					cf = Uint8ArrayToImage(image.data, image.format);
					coverAvailable = true;
					fileHadCover = true;
					return;
				}
			}
		}
		const cookie = decodeURIComponent(document.cookie);
		if (cookie) {
			if (cookie.includes("true")) {
				usePresetCover = true;
			}
		}
		updateCover();
	});

	function updateCover() {
		if (usePresetCover) {
			document.cookie = "usePresetCover=true;expires=never";
			if (fileHadCover) cfBuffer = cf;
			cf = cover;
		} else {
			document.cookie = "usePresetCover=false;expires=never";
			if (cfBuffer) {
				cf = cfBuffer;
			} else {
				cf = noCover;
				coverAvailable = false;
				return;
			}
		}
		coverAvailable = true;
	}

	async function checkTags() {
		tagsInavlid = false;
		const slashMatch = tags.track.match(/\//g);
		if (tags.track.match(/[^\d/\d]/) || (slashMatch && slashMatch.length > 1)) {
			tagsInavlid = true;
			errorMessage = lang.tagTrackError;
			return;
		}
		if (tags.year.match(/[^\d]/)) {
			tagsInavlid = true;
			errorMessage = lang.tagYearError;
			return;
		}
		errorMessage = "";
	}

	async function saveAndDl() {
		checkTags();
		if (tagsInavlid) return;

		const buffer = await convertFileToBuffer(file);
		const writer = new ID3Writer(buffer);
		writer
			.setFrame("TIT2", tags.title.trim()) // title
			.setFrame("TALB", tags.album.trim()) // album
			.setFrame("TPE1", tags.artist.split(/[,/]+/).map(s => s.trim())) // artists
			.setFrame("TCON", tags.genre.split(/[,/]+/).map(s => s.trim())) // genres
			.setFrame("TRCK", tags.track.trim()); // track number
		if (tags.year) writer.setFrame("TYER", tags.year.trim()); // year
		if (coverAvailable) {
			const imageData = await imageToUint8Array(cf);
			writer.setFrame("APIC", {
				type: 3,
				data: imageData.buffer,
				description: "cover",
				useUnicodeEncoding: false
			});
		}
		writer.addTag();
		dlToFile(writer.getBlob(), tags.title || fileName, "mp3");
		if (moreAvailable) triggerNext();
	}

	async function dropHandler(ev: DragEvent) {
		const items = ev.dataTransfer.items;
		if (items) {
			let item = items[0];
			let t = item.type;
			if (t === "image/png" || t === "image/jpeg") {
				const image = await fileToArrayBuffer(item.getAsFile());
				const buffer = new Uint8Array(image);
				const imgURL = Uint8ArrayToImage(buffer, t);
				cf = await crop(imgURL, 1);
				cfBuffer = cf;
				coverAvailable = true;
				if (usePresetCover) usePresetCover = false;
			} else {
				return;
			}
		}
	}

	function fileToArrayBuffer(file: File) {
		return new Promise<ArrayBuffer>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as ArrayBuffer);
			reader.onerror = reject;
			reader.readAsArrayBuffer(file);
		});
	}

	// https://pqina.nl/blog/cropping-images-to-an-aspect-ratio-with-javascript/
	function crop(url: string, aspectRatio: number) {
		return new Promise<string>((resolve) => {
			const inputImage = new Image();
			inputImage.onload = () => {
				const inputWidth = inputImage.naturalWidth;
				const inputHeight = inputImage.naturalHeight;
				const inputImageAspectRatio = inputWidth / inputHeight;
				let outputWidth = inputWidth;
				let outputHeight = inputHeight;
				if (inputImageAspectRatio > aspectRatio) {
					outputWidth = inputHeight * aspectRatio;
				} else if (inputImageAspectRatio < aspectRatio) {
					outputHeight = inputWidth / aspectRatio;
				}
				const outputX = (outputWidth - inputWidth) * 0.5;
				const outputY = (outputHeight - inputHeight) * 0.5;
				const outputImage = document.createElement("canvas");
				outputImage.width = outputWidth;
				outputImage.height = outputHeight;
				const ctx = outputImage.getContext("2d");
				ctx.drawImage(inputImage, outputX, outputY);
				resolve(outputImage.toDataURL());
			};
			inputImage.src = url;
		});
	}

	// https://stackoverflow.com/a/63075520/12203337
	async function imageToUint8Array(input: string) {
		return new Promise<Uint8Array>((resolve) => {
			const inputImage = new Image();
			inputImage.onload = async () => {
				const canvas = document.createElement("canvas");
				canvas.width = inputImage.width;
				canvas.height = inputImage.height;
				const ctx = canvas.getContext("2d");
				ctx.drawImage(inputImage, 0, 0);
				const blob = await new Promise<Blob>((resolve) => ctx.canvas.toBlob(blob => resolve(blob)));
				resolve(new Uint8Array(await blob.arrayBuffer()));
			};
			inputImage.src = input;
		});
	}

	function Uint8ArrayToImage(bytes: Uint8Array, format: string) {
		let encoded = "";
		bytes.forEach((byte) => encoded += String.fromCharCode(byte));
		return `data:${format};base64,${window.btoa(encoded)}`;
	}
</script>

<main>
	<table class="coverContainer">
		<col span=1 style="width: fit-content;">
		<td>
			<img alt="Cover" src={cf}/>
		</td>
		<td>
			<div class="dz border"
				on:dragenter|preventDefault
				on:dragover|preventDefault
				on:drop|preventDefault={dropHandler}
			>
				<span>
					{lang.dropMP3}
				</span>
			</div>
		</td>
	</table>

	<div class="checkboxContainer">
		<div class={usePresetCover ? "checkbox checked border" : "checkbox border"} on:click={assignCheckboxVal}>
			<input type="checkbox" value={usePresetCover}>
		</div>
		<div class="checkboxText">{lang.usePresetCover}</div>
	</div>

	<table class="attr">
		{#each [["title", "artist"], ["album", "genre"], ["year", "track"]] as tagGroup, i}
			<tr>
				{#each tagGroup as tag, j}
					<td class={i ? (j ? "right r" : "left l") : (j ? "r" : "l")}>
						<div>{tagLang[i][j]}</div>
						<input
						class="border"
						type="text"
						value={tags[tag]}
						on:change={(e) => assignToVar(e, tag)}
						>
					</td>
				{/each}
			</tr>
		{/each}
	</table>
	<div class="buttonContainer">
		<button class="border" on:click={saveAndDl}>
			{#if moreAvailable}
				{lang.saveAndNext}
			{:else}
				{lang.saveAndDl}
			{/if}
		</button>
	</div>
	<div class="errorContainer">
		<div class={errorMessage ? "errAnim" : ""}>{errorMessage}</div>
	</div>

</main>

<style scoped>
	main {
		width: 80vw;
		color: var(--tcol);
	}

	.coverContainer td {
		vertical-align: middle;
		height: 14vh;
		min-height: 14vh;
		max-height: 200px;
		width: 1vw;
	}

	table {
		width: 100%;
	}

	img {
		width: fit-content;
		height: 100%;
		margin-top: var(--border-width);
	}

	.dz {
		width: 100%;
		height: 100%;
		color: inherit;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 45px;
		transition: 0s;
	}

	input[type=checkbox],
	input[type=checkbox]:checked {
		visibility: hidden;
	}

	.checkbox {
		width: 15px;
		height: 15px;
		background: transparent;
		position: relative;
	}

	.checkboxText {
		height: auto;
		margin-left: 1vw;
	}

	.checkboxContainer {
		height: 4vh;
		display: flex;
		flex-direction: row;
		margin-top: 2vh;
		margin-bottom: 2vh;
		justify-content: left;
		align-items: center;
	}

	.checked {
		background-color: var(--tcol);
	}

	input {
		min-height: 25px;
		height: 2.5vh;
		font-size: 20px;
		width: 100%;
	}

	.attr {
		width: 100%
	}

	.l {
		padding-right: 2vw;
	}

	.r {
		padding-left: 2vw;
	}

	.left div,
	.right div {
		padding-top: 4vh;
	}

	.r div,
	.l div {
		padding-bottom: 1vh;
	}

	.buttonContainer {
		margin-top: 5vh;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
	}

	.errorContainer {
		margin-top: 4vh;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.errAnim {
		animation: errFade forwards 1s;
	}

	@keyframes errFade {
		from {
			opacity: 0;
			margin-top: -5vh;
		}
		to {
			margin-top: 0vh;
			opacity: 1;
		}
	}
</style>
