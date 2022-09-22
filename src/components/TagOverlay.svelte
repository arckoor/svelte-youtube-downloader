<script lang="ts">
	import { onMount } from "svelte";
	import { dl, getTitle } from "@/util";
	import { tOL } from "@/localise";
	import errors from "@/errors";
	import TagInstance from "@/components/TagInstance.svelte";

	export let files = []
	export let links = []
	export let throwOnError: Function;

	const lang = tOL[navigator.language == "de" ? "de" : "en"];

	let fromLink = false;
	let ready = false;
	let bufferSize = 3;
	let available = 0;

	onMount(async () => {
		if (!files.length) {
			available = links.length-1;
			fromLink = true;
			for (let i=0; i<Math.min(bufferSize, links.length); i++) {
				if (!i) {
					await dlNext(true)
				} else {
					dlNext();
				}
			}
			while (!files.length) {
				await new Promise(r => setTimeout(r, 100));
			}
			if (files.length > 0) {
					ready = true;
			}
		} else {
			if (files.length > 0) {
					available = files.length-1;
					ready = true;
			}
		}
	});

	async function dlNext(first = false) {
		const data = links.shift();
		const title = await getTitle(data);
		const audio = await dl(data, "mp3").then(async (blob: Blob) => new File([blob], title));
		if (!errors.includes(title)) {
			files.push(audio);
		} else {
			if (first) {
				throwOnError(title);
			}
			available--;
		}
	}

	async function triggerNext() {
		ready = false;
		files.shift()
		if (links.length > 0 && files.length < bufferSize) {
			dlNext();
		}
		await new Promise(r => setTimeout(r, 100));
		while (!files.length) {
			await new Promise(r => setTimeout(r, 100));
		}
		available--;
		ready = true;
	}

</script>

<main>
	{#if ready}
		<TagInstance
			file={files[0]}
			moreAvailable={available > 0}
			{triggerNext}
			{fromLink}
		/>
	{:else}
		<div class="spin-container">
			<div class="spin"></div>
			<div class="spin s"></div>
			<div class="txt">{lang.fetching}</div>
		</div>
	{/if}
</main>

<style scoped>
	main {
		height: 100vh;
		width: 100vw;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--tcol);
	}

	/* https://www.w3docs.com/snippets/css/how-to-create-loading-spinner-with-css.html#example-of-creating-a-loading-spinner-with-the-cubic-bezier-value-17 */
	.spin-container {
		text-align: center;
		height: 660px;
	}

	.spin {
		border: 4px solid var(--border);
		width: 600px;
		height: 600px;
		margin: 0 auto;
		border-radius: 50%;
		border-right-color: transparent;
		border-bottom-color: transparent;
		animation: rotate 3s cubic-bezier(0.26, 1.36, 0.74, -0.29) infinite;
	}
	.s {
		border: 4px solid var(--tcol);
		width: 640px;
		height: 640px;
		position: relative;
		top: -626px;
		border-top-color: transparent;
		border-left-color: transparent;
		animation: rotate2 3s cubic-bezier(0.26, 1.36, 0.74, -0.29) infinite;
		
	}
	@keyframes rotate {
		0% {
			transform: rotateZ(-360deg)
		}
		100% {
			transform: rotateZ(0deg)
		}
	}
	@keyframes rotate2 {
		0% {
			transform: rotateZ(360deg)
		}
		100% {
			transform: rotateZ(0deg)
		}
	}
	.txt {
		color: var(--tcol);
		font-size: 45px;
		position: relative;
		top: -976px;
	}
</style>
