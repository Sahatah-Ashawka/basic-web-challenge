# Very Basic Web Challenge

## Challenge Description

Find the hidden flag name among the footballers.

## Run

```powershell
node server.js
```

Open:

```text
http://localhost:1233
```

## Background Music

Put your MP3 here:

```text
public/assets/audio/y-que-fue.mp3
```

The page tries to start the music automatically and does not show a stop button. When the track ends, it starts again from the beginning. Some browsers may block sound until the first user interaction.

Set a custom flag if needed:

```powershell
$env:FLAG="flag{your_real_flag_here}"; node server.js
```

## Intended Solve

Clicking a footballer changes the URL to `/?name=<footballer name>`.
The item popup opens without reloading the page, so the background music keeps playing.

For example, `Neymar` becomes:

```text
/?name=Neymar
```

The flag name is not shown in the boxes. Submit `flag` directly:

```text
/?name=flag
```

The server returns the flag.
