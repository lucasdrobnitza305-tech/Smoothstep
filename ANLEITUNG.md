# SmoothStep – Prototyp starten

Dieser Ordner enthält den App-Code für die Tagesansicht von SmoothStep.
Das Expo-Grundgerüst legst du einmal auf deinem PC an, danach kopierst du diese Dateien hinein.

## Einmalig: Vorbereitung

1. **Node.js installieren:** auf https://nodejs.org die Version „LTS“ herunterladen und installieren.
2. **Expo Go aufs iPhone:** die App „Expo Go“ aus dem App Store laden.
3. PC und iPhone müssen im **gleichen WLAN** sein.

## Projekt anlegen

PowerShell öffnen (Windows-Taste, „PowerShell“ tippen) und nacheinander eingeben:

```
cd $HOME\Documents
npx create-expo-app@latest smoothstep --template blank-typescript
cd smoothstep
npx expo install expo-font @expo-google-fonts/outfit react-native-svg react-native-safe-area-context
```

`npx expo install` sucht automatisch die Paketversionen aus, die zu Expo Go passen.

## Den SmoothStep-Code einsetzen

Aus dieser ZIP-Datei in den neuen Ordner `Dokumente\smoothstep` kopieren:

- `App.tsx` → die vorhandene `App.tsx` ersetzen
- den ganzen Ordner `src` → einfach dazulegen

## Starten

In PowerShell im Ordner `smoothstep`:

```
npx expo start
```

Es erscheint ein QR-Code. Mit der normalen **iPhone-Kamera** scannen, dann öffnet sich die App in Expo Go.
Fragt Windows nach der Firewall, „Zugriff zulassen“ wählen.

Klappt die Verbindung nicht, stattdessen `npx expo start --tunnel` probieren.

## Was der Prototyp kann

- Begrüßung und Datum passend zur Tageszeit
- Die Aufgabe, die gerade zur Uhrzeit passt, erscheint groß mit Fortschrittsring und Restminuten. Sie wechselt von selbst.
- „Geschafft“ hakt die Aufgabe ab
- In einer freien Lücke wird „Paket zur Post bringen?“ vorgeschlagen; „Einplanen“ setzt es in den Plan
- Plus-Knopf und Rückblick zeigen noch einen Hinweis: diese Bildschirme kommen als Nächstes

## Wo was steht

| Datei | Inhalt |
| --- | --- |
| `src/theme.ts` | Farben, Schrift, Rundungen |
| `src/data/tasks.ts` | Beispielaufgaben und die Zeit-Logik (aktuelle Aufgabe, freie Lücken) |
| `src/screens/TodayScreen.tsx` | die Tagesansicht |
| `src/components/` | Bausteine: Fortschrittsring, Aufgaben-Bubble, Navigation, Icons |

Zum Ausprobieren eigener Aufgaben einfach `src/data/tasks.ts` ändern. Die App lädt nach dem Speichern automatisch neu.
