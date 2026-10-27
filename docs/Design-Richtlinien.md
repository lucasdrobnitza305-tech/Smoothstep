# SmoothStep – Design-Richtlinien

Diese Regeln gelten für alles, was neu gestaltet wird. Wer am Design arbeitet (Mensch, Chat oder Agent), hält sich daran. Änderungen an den Regeln werden hier eingetragen.

## Grundgefühl
- **Ruhig, aber bunt.** Gedämpfte Pastellfarben, nichts Grelles. Man soll beim Draufschauen nicht überreizt werden.
- **Bubbly und modern.** Runde Formen, Pillen statt Kästen, kein Kalender-Raster.
- **Schlicht.** Nur das Nötigste auf dem Bildschirm. Kein Schnickschnack.
- **Ein Alltagsfreund.** Freundlich im Ton („Stark gemacht!“, „Na, wie war dein Tag?“), nie belehrend oder streng.

## Farben (stehen im Code in `src/theme.ts`)
| Name | Farbe | Wofür |
| --- | --- | --- |
| ground | `#F1EEF6` | Hintergrund der App |
| surface | `#FFFFFF` | weiße Bubbles, Karten |
| ink | `#23202E` | Text, dunkle Knöpfe, Navigation |
| inkSoft | `#4A4560` | Nebentext |
| accent | `#5B45D6` | Lila für Hauptaktionen (Plus, „Geschafft“, „Weiter“) |
| lavender | `#CFC5F7` | aktuelle Aufgabe, Begrüßung |
| mint | `#BFEBD9` | Sport, Erfolge |
| peach | `#FFD3BF` | Arbeit, Einkaufen, Liegengebliebenes |
| sky | `#C4E1FA` | Abend, Rückblick |
| butter | `#FBE7A6` | Vorschläge, Morgen |

## Schrift
- **Outfit** (Google Fonts), Stärken 400, 500, 600, 700.
- Große Überschriften 30–34 pt, fett, leicht zusammengerückt.
- Fließtext 15–17 pt, Nebentext 13–14 pt.

## Formen und Abstände
- Knöpfe und Chips: komplett rund (Pille), Mindesthöhe **44 pt** zum Antippen.
- Karten: stark abgerundet (28–36 pt Radius).
- Navigation: schwebende dunkle Pille unten mit lila Plus.
- Jede Aufgabe hat ihre eigene Pastellfarbe und ein rundes Symbol.

## Bewegung
- Weich und federnd, nie hektisch. Knöpfe sinken beim Drücken leicht ein.
- Gedrückt halten bei +/- lässt Werte immer schneller laufen.
- Pro Tag höchstens ein Vorschlag, und der kommt abends, nicht tagsüber.

## Begrüßungsszene (Pixel-Stil)
- **Retro-Pixel-Art**, Zimmer von schräg oben gesehen wie in alten Handheld-Spielen.
- Das Zimmer schwebt als kleines Diorama mit eigenem Schatten auf dem Lavendel.
- Konturfarbe `#2B2346`, 1 Pixel breit. Szene: 1 Pixel = 4 pt, Figur: 1 Pixel = 5 pt.
- Grafiken werden per Skript erzeugt (`tools/pixel-art/make_pixel_art.py`, `sprites.py`; Aufruf: `python make_pixel_art.py ../../src/components/intro/art.json` im Ordner `tools/pixel-art`) und landen in `src/components/intro/art.json`.

## Die Figur
- **Eigene Figur** (keine bestehende Spiel- oder Anime-Figur nachbauen, wegen Urheberrecht).
- Kleiner Typ, 12 × 17 Pixel: türkise Kappe `#1FA7A0` mit weißem Logo, braune Haare, oranger Hoodie `#F28A3A`, Jeans `#4D6BC4`, weiße Sneaker.
- Sprite-Bilder: `idle`, `sit`, `think`, `shock`, `happy`, Laufen seitlich `walk0–2`.
- Name: noch offen.

## Barrierefreiheit
- Text-Kontrast mindestens 4,5:1.
- Jeder Knopf hat eine Beschriftung für den Screenreader.
- Farben nie als einzige Information (immer auch Text oder Symbol).
