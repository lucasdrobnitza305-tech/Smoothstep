# SmoothStep – Anleitung für Claude Code

SmoothStep ist eine To-do- und Tagesplaner-App (Expo, React Native, TypeScript), die wie ein freundlicher Alltagshelfer durch den Tag führt.
Der Besitzer ist Programmier-Einsteiger: Erkläre Schritte einfach, auf Deutsch, und sag immer, was er selbst tun muss (z. B. App neu laden).

## Wichtige Dokumente
- `docs/Projekt-Ueberblick.md` – worum es geht, Kernideen, Ordnerstruktur
- `docs/Design-Richtlinien.md` – Farben, Schrift, Formen, Pixel-Stil, Figur (verbindlich für alles Visuelle)
- Aufgabenliste: liegt im Claude-Projekt „Erstideen zur App“ (`SmoothStep/Aufgaben.md`)

## Befehle
- App starten: `npx expo start --tunnel` (oder Doppelklick auf `SmoothStep starten.bat`), QR-Code mit dem iPhone scannen
- Mit leerem Zwischenspeicher: `npx expo start --tunnel -c`
- Typen prüfen: `npx tsc --noEmit`
- Pakete hinzufügen: immer `npx expo install <paket>` (nicht `npm install`), damit die Versionen zu Expo Go passen
- Sichern: `git add .` → `git commit -m "Beschreibung"` → `git push`

## Regeln
- Getestet wird in **Expo Go** auf dem iPhone: keine Pakete mit eigenem nativen Code, die Expo Go nicht kennt.
- Bildschirme liegen in `app/` (Expo Router) und verweisen auf `src/screens/`. Keine Bausteine direkt in `app/` ablegen.
- Alles, was gespeichert wird, läuft über `src/store/task-store.tsx`.
- Farben und Schrift nur aus `src/theme.ts`, keine neuen Farbwerte quer im Code verteilen.
- Kleine Schritte: eine Aufgabe → testen lassen → Feedback → weiter.
- Selbst erledigen statt Befehle zum Abtippen geben: Typen prüfen, Pakete installieren, App-Server starten usw. führt Claude selbst aus. Was absehbar als Nächstes nötig ist, gleich mit übernehmen.
- Sobald der Besitzer bestätigt, dass eine Änderung auf dem iPhone funktioniert, selbst `git add / commit / push` ausführen und kurz sagen, was gesichert wurde.
- Selbst machen muss der Besitzer nur, was Claude nicht kann (iPhone testen, QR-Code scannen, auf GitHub klicken). Das klar und Schritt für Schritt sagen.
- Eine Aufgabe = ein eigener Chat. Taucht nebenbei eine neue, eigenständige Aufgabe auf, dafür einen eigenen Chat vorschlagen.
- Keine geschützten Figuren, Logos oder Marken nachbauen.

## Agents
Im Ordner `.claude/agents/` liegen drei Spezialisten:
- **design** – Gestaltung, Animationen, Pixel-Art
- **funktionen** – neue Funktionen, Logik, Speichern
- **pruefer** – prüft Änderungen auf Fehler, bevor sie getestet werden
