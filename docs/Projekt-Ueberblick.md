# SmoothStep – Projekt-Überblick

Lies dieses Dokument zuerst, wenn du am Projekt weiterarbeitest.

## Die App in einem Satz
SmoothStep ist eine To-do- und Tagesplaner-App fürs Handy, die wie ein freundlicher Alltagshelfer durch den Tag führt, sanft erinnert und aus dem Alltag mitlernt.

## Kernideen
- **Tagesansicht:** Die Aufgabe, die gerade zur Uhrzeit passt, steht groß im Mittelpunkt, darunter nur das, was als Nächstes kommt.
- **Einrichtung beim ersten Start:** Aufstehen/Schlafen, feste Routinen mit Wochentagen, Erinnerungsstil.
- **Drei Aufgabenarten:** feste Uhrzeit, flexibel (App sucht eine freie Lücke), wiederkehrend.
- **Erinnerungen in Stufen:** Start, nach 15 Minuten nachhaken (falls nicht abgehakt), Ende. Stil: sanft, ausgewogen, dranbleiben.
- **Abendrückblick:** Was hat geklappt? Was ist liegen geblieben und warum (keine Zeit, vergessen, keine Energie, kam was dazwischen, doch nicht nötig)?
- **Mitlernen:** Aus Mustern entstehen Vorschläge. Höchstens einer pro Tag, erst ab einem Muster, abgelehnte Vorschläge werden respektiert.
- **Später:** Wissens-Bubbles pro Tätigkeit (Sport-Übungen, Rezepte, Einkaufsliste, Schlaf-Tipps).

## Technik
- **Expo** (React Native) mit **TypeScript**, Navigation mit **Expo Router**.
- Läuft für iPhone und Android. Getestet wird auf dem iPhone mit **Expo Go**.
- Speichern auf dem Handy mit **AsyncStorage**.
- Code auf GitHub: privates Repository `lucasdrobnitza305-tech/Smoothstep`.

## Ordnerstruktur
| Ordner/Datei | Inhalt |
| --- | --- |
| `app/` | Bildschirme als Routen: `index` (Heute), `add`, `review`, `week`, `onboarding`, `_layout` |
| `src/screens/` | Inhalt der Bildschirme |
| `src/components/` | Bausteine: Navigation, Fortschrittsring, Halten-Knopf, Begrüßungsszene |
| `src/store/task-store.tsx` | Alles, was gespeichert wird (Aufgaben, Profil, Abgehaktes) |
| `src/data/` | Beispielaufgaben, Routinen-Vorschläge, Zeit-Logik |
| `src/theme.ts` | Farben, Schrift, Rundungen |
| `docs/` | Dieser Überblick und die Design-Richtlinien |
| `tools/pixel-art/` | Python-Skripte, die die Pixel-Grafiken der Begrüßung erzeugen |
| `CLAUDE.md`, `.claude/agents/` | Anleitung und Agents für Claude Code |

## So wird gearbeitet
1. Aufgaben stehen im Claude-Projekt in **Aufgaben.md**, sortiert nach Kategorie (Design, Funktionen, Technik, Fehler, Konzept).
2. Immer nur eine Aufgabe gleichzeitig: bauen → auf dem iPhone testen → Feedback → nachbessern.
3. Wenn etwas funktioniert: mit Git sichern (`git add .` → `git commit -m "…"` → `git push`).

## App starten
Doppelklick auf **„SmoothStep starten.bat“**, QR-Code mit der iPhone-Kamera scannen. Das Fenster offen lassen.
