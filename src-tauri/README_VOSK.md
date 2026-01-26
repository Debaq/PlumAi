# Vosk Setup for PlumAi

To run the speech recognition feature, the application needs `libvosk.so`.

I have downloaded `libvosk.so` to this directory (`src-tauri/`).

## Running in Dev Mode
You may need to set `LD_LIBRARY_PATH` to include the current directory when running:
```bash
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$(pwd)/src-tauri
npm run tauri dev
```

## Building
For the final build to work, `libvosk.so` must be available in the library path or bundled with the app.
