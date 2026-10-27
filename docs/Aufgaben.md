# SmoothStep – Aufgabenliste

Stand: 27.10.2026. Jede Aufgabe gehört zu genau einer Kategorie.
Status: ✅ erledigt · 🔧 in Arbeit · ⬜ offen.
Neue Aufgaben unten in der passenden Kategorie ergänzen. Erledigtes nach unten in „Erledigt“ verschieben.
Jede Aufgabe bekommt einen eigenen Chat, Name nach dem Schema **Kategorie · Was genau** (z. B. „Fehler · Absturz beim Abhaken“).

## 🎨 Design
| Status | Aufgabe | Notiz |
| --- | --- | --- |
| 🔧 | Begrüßungsszene (Pixel-Zimmer + Figur mit Kappe) überarbeiten | Läuft, wird später verfeinert |
| ⬜ | Figur einen Namen geben | Danach kann sie in der App wieder auftauchen |
| ⬜ | Figur in der App wieder einsetzen (Rückblick, Erinnerungen) | Macht die App persönlicher |
| ⬜ | Weckbildschirm am Morgen gestalten | Nach dem Klingeln: „Das steht heute an“ |
| ⬜ | App-Icon und Startbildschirm (Splash) | Aktuell noch Expo-Standard |
| ⬜ | Entscheiden: Pixel-Stil nur in der Szene oder auch in der App? | Wichtig für einheitlichen Look |

## ⚙️ Funktionen
| Status | Aufgabe | Notiz |
| --- | --- | --- |
| ⬜ | Erinnerungen per Benachrichtigung (Start, +15 Min, Ende) | Herzstück; richtet sich nach dem Erinnerungsstil aus der Einrichtung |
| ⬜ | Eingebauter Wecker mit sanften Melodien | Zeit aus der Einrichtung |
| ⬜ | Gründe im Abendrückblick speichern | Grundlage fürs Mitlernen |
| ⬜ | Mitlernen: Vorschläge aus Mustern (max. 1 pro Tag, erst ab Muster, Ablehnen respektieren) | Regeln stehen im Konzept |
| ⬜ | Aufgaben bearbeiten und löschen | Bisher nur anlegen |
| ⬜ | „Morgen“ und „Diese Woche“ in der Tagesansicht befüllen | Knöpfe sind schon da |
| ⬜ | Wochenend-Zeiten aus der Einrichtung im Plan nutzen | Werden schon gespeichert |
| ⬜ | Wissens-Bubbles pro Tätigkeit (Sport, Kochen, Einkaufen, Schlafen) | Für später |
| ⬜ | Spracheingabe direkt in der App | Braucht eine eigene Test-Version statt Expo Go |

## 🛠️ Technik
| Status | Aufgabe | Notiz |
| --- | --- | --- |
| ⬜ | Expo-Schlüssel erneuern (stand im Chat) | Auf expo.dev neu erstellen, mit setx speichern. Wichtig: der alte Schlüssel ist sichtbar gewesen |
| ⬜ | Alte Dateien löschen: App.tsx, index.ts, src/screens/AddTaskSheet.tsx | Werden nicht mehr benutzt |
| ⬜ | Windows-Firewall einstellen, damit Expo ohne Tunnel läuft | Schneller, QR-Code bleibt gleich |
| ⬜ | Später: Veröffentlichung im App Store / Play Store vorbereiten | Apple-Entwicklerkonto nötig |

## 🐞 Fehler
| Status | Aufgabe | Notiz |
| --- | --- | --- |
| ⬜ | Gedrückthalten der Uhrzeit nochmal testen | Reparatur kam erst heute korrekt an |
| ⬜ | Expo-Verbindung bricht nach langer Zeit ab | Lösung bisher: neu starten + QR neu scannen |

## 💡 Konzept
| Status | Aufgabe | Notiz |
| --- | --- | --- |
| ⬜ | Endgültigen App-Namen festlegen und prüfen | Arbeitstitel: SmoothStep |
| ⬜ | Entscheiden, wie die App Geld verdienen soll (kostenlos, Abo, Einmalkauf) | Vor der Veröffentlichung |

## ✅ Erledigt
| Kategorie | Aufgabe |
| --- | --- |
| Technik | Auf Claude Code umsteigen und Agents nutzen (Agents in `.claude/agents`, Überblick-Panel, Aufgabenliste im Projekt) |
| Konzept | Grundkonzept (Tagesplan, Erinnerungsstufen, Abendrückblick, Mitlernen, Wissens-Bubbles) |
| Konzept | Arbeitstitel SmoothStep |
| Design | Erste Bildschirm-Entwürfe, danach bubbly Look (Pastell, Pillenformen, schwebende Leiste, Schrift Outfit) |
| Design | Entwürfe der Einrichtung (5 Schritte) |
| Design | Begrüßungsszene: 3 Stil-Runden bis zur Pixel-Version |
| Funktionen | Tagesansicht mit aktueller Aufgabe nach Uhrzeit, Fortschrittsring, „Geschafft“ |
| Funktionen | Neue Aufgabe anlegen (fest, flexibel, wiederkehrend), Uhrzeit mit Gedrückthalten und Schnellwahl |
| Funktionen | Flexible Aufgaben werden in freie Lücken vorgeschlagen |
| Funktionen | Abendrückblick mit Gründe-Abfrage (noch ohne Speichern) |
| Funktionen | Wochenübersicht |
| Funktionen | Einrichtung beim ersten Start (Tagesrahmen, Routinen mit Wochentagen, Erinnerungsstil) |
| Technik | Expo-Projekt mit TypeScript, läuft auf dem iPhone über Expo Go |
| Technik | Navigation mit mehreren Bildschirmen (Expo Router) |
| Technik | Dauerhaftes Speichern auf dem Handy |
| Technik | Git + GitHub (privates Repository) |
| Technik | Startdatei „SmoothStep starten.bat“ |
