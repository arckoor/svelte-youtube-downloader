export const language = ["de", "de-DE"].includes(navigator.language) ? "de" : "en";

export const iML = {
	en : {
		urlPlaceholder: "Paste your YouTube URL here...",
		fileDownload: "Download directly",
		tagDownload: "Download and edit tags",
		dropMP3: "Click or drop your MP3 files here",
		downloading: "Downloading your files...",
		done: "Done!",
		formats: {
			"mp3": "MP3/audio",
			"opus": "OPUS/audio",
			"flac": "FLAC/audio",
			"mp4": "MP4/video",
		}
	},
	de: {
		urlPlaceholder: "Füge hier deine YouTube URL ein...",
		fileDownload: "Direkt herunterladen",
		tagDownload: "Herunterladen und editieren",
		dropMP3: "Klicke oder ziehe deine MP3-Dateien hierher",
		downloading: "Dateien herunterladen...",
		done: "Fertig!",
		formats: {
			"mp3": "MP3/Audio",
			"opus": "OPUS/Audio",
			"flac": "FLAC/Audio",
			"mp4": "MP4/Video",
		}
	}
};

export const tOL = {
	en: {
		"fetching": "Fetching your audio file..."
	},
	de: {
		"fetching": "Laden der Audiodatei..."
	}
};

export const tIL = {
	en: {
		dropMP3: "Drop your cover file here (png/jpg)",
		usePresetCover: "Use the preset cover",
		saveAndDl: "Save and Download",
		saveAndNext: "Download and edit next file",
		title: "Title",
		artist: "Artist",
		album: "Album",
		genre: "Genre",
		year: "Year",
		track: "Track",
		tagTrackError: "Tracks must be in the format of 1 or 1/3",
		tagYearError: "Year must be an integer number"
	},
	de: {
		dropMP3: "Ziehe deine Cover-Datei hierher (png/jpg)",
		usePresetCover: "Das voreingestellte Cover benutzen",
		saveAndDl: "Speichern und herunterladen.",
		saveAndNext: "Herunterladen und nächste Datei editieren",
		title: "Titel",
		artist: "Künstler",
		album: "Album",
		genre: "Genre",
		year: "Jahr",
		track: "Titelnummer",
		tagTrackError: "Titelnummer muss im Format 1 oder 1/3 sein",
		tagYearError: "Jahr muss eine Ganzzahl sein"
	}
};

export const err = {
	en: {
		"dlErr//400": "There was an issue downloading the video. Please check if the URL is correct.",
		"dlErr//401": "The request was not correctly authenticated.",
		"dlErr//403": "Access to this resource is forbidden.",
		"dlErr//404": "The requested resource was not found.",
		"dlErr//500": "An internal server error has occurred. Please try again later.",
		"dlErr//404//p": "Unable to access this playlist.",
		"Failed to fetch": "Could not connect to server. Please try again later.",
	},
	de : {
		"dlErr//400": "Beim Herunterladen des Videos ist ein Fehler aufgestoßen. Bitte überprüfe die URL.",
		"dlErr//401": "Die Anfrage war nicht korrekt authentifiziert.",
		"dlErr//403": "Zugriff auf diese Ressource ist nicht zugelassen.",
		"dlErr//404": "Die angefragte Resource wurde nicht.",
		"dlErr//500": "Ein Serverfehler ist aufgetreten. Bitte versuche es später erneut.",
		"dlErr//404//p": "Auf diese Playlist kann nicht zugegriffen werden.",
		"Failed to fetch": "Verbindung zum Server konnte nicht hergestellt werden. Bitte versuche es später erneut.",
	}
};
