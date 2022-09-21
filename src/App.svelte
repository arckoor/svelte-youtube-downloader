<script lang="ts">
	import InputManager from "@/components/InputManager.svelte";
	let files: File[];
	let links: String[];
	let tagOverlayEnabled = false;

	const assignFiles = (f: File[]) => { files = f; tag()};
	const assignLinks = (l: String[]) => { links = l; tag();}
	const tag = () => tagOverlayEnabled = true;
</script>

<main>
	<InputManager {assignFiles} {assignLinks} />
</main>

<style>
</style>
