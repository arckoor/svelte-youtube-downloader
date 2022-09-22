const serverURL = import.meta.env.DEV ? import.meta.env.VITE_LOCALHOST : import.meta.env.VITE_ONLINE_HOST

const options = {
	method: "GET",
	headers: {
		"arckoor-dl-api-key": import.meta.env.VITE_ARC_API_KEY
	}
}

export async function dl(url: String, format: String) {
	return await fetch(`${serverURL}/download?url=${url}&format=${format}`, options)
		.then((res) => {
			// https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#reading_the_stream
			const reader = res.body.getReader();
			return new ReadableStream({
				start(controller) {
					return pump();
					async function pump() { // that async might hurt, not sure
						return reader.read().then(({ done, value }) => {
							// When no more data needs to be consumed, close the stream
							if (done) {
								controller.close();
								return;
							}
							// Enqueue the next data chunk into our target stream
							controller.enqueue(value);
							return pump();
						});
					}
				}
			})
		})
		// Create a new response out of the stream
		.then((stream) => new Response(stream))
		.then((res) => res.blob())
		.catch((error) => console.log(error))
}

export async function getTitle(url: String) {
	return await fetch(`${serverURL}/title?url=${url}`, options)
	.then((res) => {
		if (!res.ok) {
			throw new Error(`dlErr//${res.status}`);
		}
		return res.json();
	})
	.then((json) => json.title)
	.catch((error) => error.message)
}

export async function dlToFile(blob: Blob, title: String, format: String) {
	let a = document.createElement("a"), url = URL.createObjectURL(blob);
	a.href = url;
	a.download = `${title}.${format}`;
	document.body.appendChild(a);
	a.click();
	setTimeout(() => {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 0);
}

export async function getPlaylistItems(url: String) {
	return await fetch(`${serverURL}/resolvePlaylist?url=${url}`, options)
	.then((res) => {
		if (!res.ok) {
			throw new Error(`dlErr//${res.status}`);
		}
		return res.json();
	})
	.then((json) => json.items)
	.catch((error) => [error.message])
}

export function convertFileToBuffer(file: File) {
	return new Promise<ArrayBuffer>((resolve) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result as ArrayBuffer);
		}
		reader.readAsArrayBuffer(file);
	});
}