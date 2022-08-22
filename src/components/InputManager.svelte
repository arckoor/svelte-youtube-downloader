<script lang="ts">
import { dl, getTitle, getPlaylistItems, dlToFile } from "../util"

let url= "https://youtu.be/moZtoMP7HAA";
let format = "mp3";
let fileInput: HTMLInputElement;

const formats = [
	["mp3", "MP3/audio"],
	["opus", "OPUS/audio"],
	["flac", "FLAC/audio"],
	["ogg", "OGG/audio"],
	["m4a", "M4A/audio"],
	["mp4", "MP4/video"],
]

const assignURL = (event: Event) => url = (event.target as HTMLInputElement).value;
const assignFormat = (event: Event) => format = formats[(event.target as HTMLSelectElement).selectedIndex][0];

function dropHandler(ev: DragEvent) {
	const files = []
	const items = ev.dataTransfer.items;
	if (items) {
		for (let i=0; i<items.length; i++) {
			if (!(items[i].kind === "file")) {
				// yell at the user
				return;
			} else {
				files.push(items[i].getAsFile());
			}
		}
	}
	console.log(files);
}

function inputHandler() {
	const files = []
	for (let i=0; i<fileInput.files.length; i++) {
		if (fileInput.files[i].type === "audio/mpeg") {
			files.push(fileInput.files[i]);
		}
	}
	console.log(files);
}

function handleClick() {
	fileInput.click();
}


async function directDownload() {
	const localURL = url;
	if (localURL == "") {
		return;
	}
	let videos = [];
	if (localURL.includes("playlist")) {
		videos = await getPlaylistItems(url);
	} else {
		videos = [url];
	}
	videos.forEach(async (value) => {
		const title = await getTitle(value);
		await dl(value, format)
		.then((blob) =>  dlToFile(blob, title, format))
		.catch((err) => console.error(err));
	})
}

</script>

<main>
	<input type="text" on:input={assignURL} value={url}>
	<select on:change={assignFormat}>
		{#each formats as format}
			<option value={format[0]}>{format[1]}</option>
		{/each}
	</select>
	<button on:click={directDownload} disabled={url == ""}>Direct Download</button>
	<button on:click={console.log("aaaaaaaaaaaaaaah")} disabled={format != "mp3" || url == ""}>Tagger Download</button>
	<div
		class="dropZone"
		on:click={handleClick}
		on:dragenter|preventDefault
		on:dragover|preventDefault
		on:drop|preventDefault={dropHandler}
	>
		<input
			bind:this={fileInput}
			type="file"
			multiple
			style="display: none;"
			accept=".mp3"
			on:change={inputHandler}
		>
	</div>
</main>

<style>
.dropZone {
	align-items: center;
	border-radius: 5px;
	border: 4px dashed #000000;
	display: flex;
	font-size: 3.5vh;
	height: 33vh;
	justify-content: center;
	margin-bottom: 10px;
	width: 95%;
}
</style>
