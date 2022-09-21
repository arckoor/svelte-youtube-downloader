<script lang="ts">
import { dl, getTitle, getPlaylistItems, dlToFile } from "@/util";
import { iML } from "@/localise";

const lang = iML[navigator.language == "de" ? "de" : "en"];

export let assignFiles: (f: File[]) => void;
export let assignLinks: (l: String[]) => void;

let url = "";
let format = "mp3";
let fileInput: HTMLInputElement;
let errorMessage = "";

const formats = [
	["mp3", lang.formats.mp3],
	["opus", lang.formats.opus],
	["flac", lang.formats.flac],
	["ogg", lang.formats.ogg],
	["m4a", lang.formats.m4a],
	["mp4", lang.formats.mp4],
]

const assignURL = (event: Event) => url = (event.target as HTMLInputElement).value;
const assignFormat = (event: Event) => format = formats[(event.target as HTMLSelectElement).selectedIndex][0];

function dropHandler(ev: DragEvent) {
	const files = []
	const items = ev.dataTransfer.items;
	if (items) {
		for (let i=0; i<items.length; i++) {
			if (items[i].type === "audio/mpeg") {
				files.push(items[i].getAsFile());
			} else {
				return;
			}
		}
	}
	assignFiles(files);
}

function inputHandler() {
	const files = []
	for (let i=0; i<fileInput.files.length; i++) {
		if (fileInput.files[i].type === "audio/mpeg") {
			files.push(fileInput.files[i]);
		} else {
			return;
		}
	}
	assignFiles(files);
}

function handleClick() {
	fileInput.click();
}

async function determineMethod(state: Boolean) {
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
	if (!state) {
		await directDownload(videos)
	} else {
		assignLinks(videos);
	}
}

async function directDownload(videos: string[]) {
	const errors = ["dlErr//400", "dlErr//401", "dlErr//403", "dlErr//404", "dlErr//500", "Failed to fetch"]
	if (!errors.includes(videos[0])) {
		videos.forEach(async (value) => {
			const title = await getTitle(value);
			if (title && !errors.includes(title)) {
				await dl(value, format)
				.then((blob: Blob) =>  dlToFile(blob, title, format))
				.catch((err) => console.error(err));
			} else {
				errorMessage = lang.errors[title];
			}
		});
		if (videos.length > 1) {
			errorMessage = lang.errors["multipleFiles"];
		} 
	} else {
		errorMessage = lang.errors[videos[0]+"//p"];
	}
} 

</script>

<main>
	<div class="inputContainer">
		<input 
			placeholder={lang.urlPlaceholder}
			class="border"
			type="text"
			on:input={assignURL} value={url}
			on:dragstart|preventDefault
		>
		<select class="border" on:change={assignFormat}>
			{#each formats as format}
				<option value={format[0]}>{format[1]}</option>
			{/each}
		</select>
	</div>
	<div class="ioContainer">
		<div class="buttonContainer">
			<button
				class="border"
				on:click={() => determineMethod(false)}
				disabled={url == ""}
			>
				{lang.fileDownload}
			</button>
		</div>
		<div class="errorContainer">
			<div class={errorMessage ? "err errAnim" : "err"} style={errorMessage ? "" : "opacity: 0;"}>
					{errorMessage}
			</div>
		</div>
	</div>
	<div
		class="dz border"
		on:click={handleClick}
		on:dragenter|preventDefault
		on:dragover|preventDefault
		on:drop|preventDefault={dropHandler}
	>
		<span>
			{lang.dropMP3}
		</span>
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

<style scoped>
	main {
		margin: 25vh 0 0 10vw;
		width: 80vw;
		height: 75vh;
		color: var(--tcol);
	}

	.inputContainer {
		width: 100%;
		display: flex;
		align-items: stretch;
		justify-content: center;
	}

	button {
		margin-left: 2%;
		margin-right: 2%;
		max-height: 90px;
	}

	input {
		width: 88%;
		height: 50px;
		margin-right: 2%;
	}

	input::placeholder {
		color: rgb(160, 160, 160)
	}

	select {
		cursor: pointer;
		font-size: inherit;
		min-width: 120px;
		width: 13%;
		text-align: center;
		background-color: inherit;
		color: inherit;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	select option {
		border: 1px solid var(--tcol);
		background: rgb(59, 59, 59);
	}

	select option:checked {
		background: rgb(92, 92, 92);
	}

	.buttonContainer {
		height: 5vh;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
	}

	.ioContainer {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 18vh;
		flex-direction: column;
	}

	.dz {
		cursor: pointer;
		height: 33vh;
		color: inherit;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 55px;
		transition: 0s;
	}

	.errorContainer {
		margin-top: -2.5vh;
		text-align: center;
		width: 100%;
		height: fit-content;
	}

	.err {
		vertical-align: top;
		max-width: 80vw;
		display: inline-block;
		transition: width 0s;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	} 
	.errAnim {
		animation: errFade forwards 1s;
	}

	@keyframes errFade {
		from {
			opacity: 0;
		}
		to {
			padding-top: 4vh;
			padding-bottom: 2vh;
			margin-bottom: -4vh;
			opacity: 1;
		}
	}

</style>
