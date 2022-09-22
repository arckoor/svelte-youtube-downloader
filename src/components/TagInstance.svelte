<script lang="ts">
	import { onMount } from "svelte";
	import { parse } from "id3-parser";
	import { dlToFile, convertFileToBuffer } from "@/util";
	import { tIL } from "@/localise";
	import cover from "@/assets/cover";
	import noCover from "@/assets/no-cover";
	import ID3Writer from "browser-id3-writer";

	const lang = tIL[navigator.language == "de" ? "de" : "en"];
	const tagLang = [[lang.title, lang.artist], [lang.album, lang.genre], [lang.year, lang.track]]
	export let file: File;
	export let moreAvailable: Boolean;
	export let triggerNext: Function;
	export let fromLink: Boolean;

	let fileName = file.name;
	let cfBuffer: string;
	let cf: string;
	let usePresetCover = false;
	let fileHadCover = false;
	let coverAvailable = false;
	let tagsInavlid = false;

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
	}

	onMount(async () => {
		if (!fromLink) fileName = fileName.replace(/\.[^/.]+$/, "");
		const buffer = new Uint8Array(await convertFileToBuffer(file));
		const tag = parse(buffer);
		if (tag) {
			tags.title = tag.title || (fileName || "");
			tags.artist = tag.artist || "";
			tags.album = tag.album || "";
			tags.genre = tag.genre || "";
			tags.year = tag.year || "";
			// @ts-ignore
			tags.track = tag.track || "" ;
			if (tag.image) {
				cf = imageURL(tag.image.data, tag.image.mime);
				fileHadCover = true;
				return;
			}
		}
		const cookie = decodeURIComponent(document.cookie);
		let co = false;
		if (cookie) {
			if (cookie.includes("true")) {
				co = true;
			}
		}
		if (usePresetCover || co) {
			usePresetCover = true;
			cf = cover;
			coverAvailable = true;
		} else {
			cf = noCover;
		}
	});

	function updateCover() {
		if (usePresetCover) {
			document.cookie = "usePresetCover=true;expires=never";
			if (fileHadCover) {
				cfBuffer = cf;
			}
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
		if (tags.track.match(/[^\d\/\d]/) || (slashMatch && slashMatch.length > 1)) {
				tagsInavlid = true;
				console.log("nonononono");
				return;
		}
		if (tags.year.match(/[^\d]/)) {
				tagsInavlid = true;
				console.log("nonononono");
				return;
		}
	}

	async function saveAndDl() {
		checkTags();
		if (tagsInavlid) return;

		const buffer = await convertFileToBuffer(file)
		const writer = new ID3Writer(buffer);
		writer
			.setFrame("TIT2", tags.title) // title
			.setFrame("TALB", tags.album) // album
			.setFrame("TPE1", tags.artist.split(/[,\/]+/).map(s => s.trim())) // artists
			.setFrame("TCON", tags.genre.split(/[,\/]+/).map(s => s.trim())) // genres
			.setFrame("TYER", Number(tags.year)) // year
			.setFrame("TRCK", tags.track) // track number 
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
		dlToFile(writer.getBlob(), fileName, "mp3")
		if (moreAvailable) triggerNext();
	}

	async function dropHandler(ev: DragEvent) {
		const items = ev.dataTransfer.items;
		if (items) {
			let item = items[0];
			let t = item.type;
			if (t === "image/png" || t === "image/jpeg") {
				const image = await loadFile(item.getAsFile());
				const buffer = new Uint8Array(image)
				const imgURL = imageURL(buffer, t)
				cf = await crop(imgURL, 1)
				cfBuffer = cf;
				coverAvailable = true;
				if (usePresetCover) { usePresetCover = false; }
			} else {
				return;
			}
		}
	}

	function loadFile(file: File) {
		return new Promise<ArrayBuffer>((resolve, reject) => {
			const reader = new FileReader()
			reader.onload = () => {
				resolve(reader.result as ArrayBuffer)
			}
			reader.onerror = reject
			reader.readAsArrayBuffer(file)
		})
	}

	function imageURL(bytes, format) {
		let encoded = ''
		bytes.forEach(function (byte) {
			encoded += String.fromCharCode(byte)
		})
		return `data:${format};base64,${window.btoa(encoded)}`
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

				const outputImage = document.createElement('canvas');

				outputImage.width = outputWidth;
				outputImage.height = outputHeight;

				const ctx = outputImage.getContext('2d');
				ctx.drawImage(inputImage, outputX, outputY);
				resolve(outputImage.toDataURL());
			}
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
				const blob = await new Promise<Blob>((resolve) => ctx.canvas.toBlob(blob => resolve(blob)))
				resolve(new Uint8Array(await blob.arrayBuffer()));
			}
			inputImage.src = input;
		});
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

</main>

<style scoped>
	main {
		margin: 25vh 0 0 10vw;
		width: 80vw;
		height: 75vh;
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
</style>
