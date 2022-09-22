<script lang="ts">
	import { err } from "@/localise";
	import InputManager from "@/components/InputManager.svelte";
	import TagOverlay from "@/components/TagOverlay.svelte";
	let files: File[];
	let links: String[];
	let tagOverlayEnabled = false;
	let errorMessage = "";

	const assignFiles = (f: File[]) => { files = f; tag()};
	const assignLinks = (l: String[]) => { links = l; tag();}
	const tag = () => tagOverlayEnabled = true;
	const throwOnError = (e: string) => {
		errorMessage = err[navigator.language == "de" ? "de" : "en"][e];
		tagOverlayEnabled = false;
	} 
</script>

<main>
	{#if !tagOverlayEnabled}
		<InputManager {assignFiles} {assignLinks} {errorMessage}/>
	{:else}
		<TagOverlay {files} {links} {throwOnError}/>
	{/if}
</main>

<style>
</style>
