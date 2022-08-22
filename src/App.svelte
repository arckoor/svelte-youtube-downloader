<script lang="ts">
	import InputManager from "./components/InputManager.svelte";
</script>

<main>
	<InputManager />
</main>

<style>
</style>

<!-- 
How will this page be structured?

Main Page:
	Input field for youtube links
	Drop Zone for already existing MP3 files

	If youtube link:
		if single video:
			options:
				format
				filename
				if mp3:
					straight away download
					download and edit with mp3tagger
				else:
					download straight away
		else if playlist:
			retrieve individul videos with /resolvePlaylist
			options:
				format (for all videos)
				filename will be the default provided by the api
				if mp3:
					straight away download all
					download each one seperately, after the previous one was finished in the mp3tagger
				else:
					download straight away
		if mp3tagger:
			continue in else clause below
	else:
		load file with mp3 tagger
		edit values
		download button
		next button in case of playlist

Components:
	FileManager:
		accepts (multiple) files; only mp3
		accepts a youtube link
		if single video / file: provides a single file to the tagger / download component -> list of length 1
		if multiple files / playlist: provides a list of file to the tagger / download component

	MP3Tagger:
		accepts list of files
		instances editInterface:
			provides text fiels for editing tags
			has to prefill from existing tags
			file input for thumbnail
		shows "Next" if list length > 1
	
	Downloader:
		accepts list of files
		downloads a file
		what about multi downloads? gotta ask for permission

-->