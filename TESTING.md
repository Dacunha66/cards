# Testprotokoll

## Version 1.6 – Liga-Grundlagen

Neu: Deckregeln je Modus, Felsfeld, Match-Format (2 Runden + Entscheidungsduell), faire Lauf-Angebote mit Match-Seed, Aufzeichnen/Nachspielen des Laufs, Collection-League-Testmodus. Das Abenteuer ist unverändert.

**Automatische Tests (insgesamt 113, alle bestanden), neu:** Deckregeln (Kopien, Legendär/Mystisch/Episch, Besitz), automatisches Deck, Felsfeld (15 Züge, nie spielbar, kein Unentschieden, Fairness 40–60 % über 3000 Partien), Match-Format (Münzwurf, Tausch, 2:0, Entscheidungsduell und dessen Fairness), Lauf-Angebote (gleicher Seed = gleiche Angebote, 2 Deck + 1 neutral, ohne Zurücklegen, gleiche Entdeckungen und Steine für beide, mittlere Stärke), SHA-256-Fingerabdruck, Nachspielen ergibt exakt dieselben Karten/Strafen (40 Läufe), gefälschte Eingaben werden erkannt.

**Browser-Durchlauf:** Liga-Deck (Grenzen greifen), Match-Code und Fingerabdruck, Lauf ohne Vorspulen (ca. 32 s), Runden mit Fels, Ergebnis „Lauf-Prüfung: ✓ nachgespielt und bestätigt“. Abenteuer und Admin-Dashboard unverändert ohne Fehler.

**Supabase:** Tabellen `cards`, `game_settings`, `profiles`, `admins`, Bild-Speicher `card-images` mit Zeilen-Sicherheit. 101 Karten übernommen. Geprüft: Besucher lesen Karten, sehen keine Admins/Profile; ein angemeldeter Nicht-Admin ändert 0 Zeilen und kann keine Karte anlegen.

## Version 1.5 – Balancing, Lauf-Verwaltung, neuer Lauf

Neue Lauf-Regeln (vom Auftraggeber gewünscht): Tor 1–7 nur Deckkarten, Tor 8 (Finale) drei neue Karten; Lauf ca. 30 s statt 40 s; 15 Steinreihen statt 7 (eine Reihe kann zwei Spuren sperren, eine Spur bleibt immer frei). Alle anderen Regeln unverändert; neue Einstellungen starten mit den bisherigen Werten.

**Automatische Tests (insgesamt 89, alle bestanden), neu/angepasst:**
- Tor 1–7: drei verschiedene Deckkarten; Finaltor: drei verschiedene Karten, die der Spieler noch nicht besitzt
- Mehr Hindernisse, immer eine Spur frei; Ausweichen ⇒ keine Schwächung; Treffer ⇒ höchstens −1 pro Karte; immer genau 8 Karten; Dauer 25–35 s
- Häufigkeiten: Standard = bisherige Werte; ungültige Einstellungen ⇒ Standard; „nur Legendär“ ⇒ nur legendäre Karten im Finaltor; höheres Gewicht ⇒ häufiger; Speichern/Laden; Spieler können Einstellungen nicht ändern
- „Nicht im Lauf“: erscheint nie als neue Karte, eigene Deckkarten bleiben nutzbar
- „Nur Belohnung“: nie in Booster-Packs, aber im Finaltor gewinnbar; wird nicht verschenkt
- Stärke-Übersicht: die 100 vorhandenen Karten sind unauffällig; ±3 Punkte vom Schnitt ⇒ Warnung; Vergleich nur mit aktiven Karten

**Browser-Durchlauf mit nachgebauter Plattform:** Balancing-Reiter (Sortierung, Auffällige, Karte pausieren ⇒ verschwindet für Spieler), Lauf-Reiter (Gewicht ändern, speichern), Editor-Schalter mit Warnung „kann niemand bekommen“, neuer Lauf (Tor 1 „aus deinem Deck“, Finaltor mit neuen Karten, Gesamtdauer ca. 31 s). Keine Fehler.

## Version 1.4 – Admin-Dashboard

Sicherung vor dem Umbau: Stand v1.3 = Commit `2ab6b82` (auf GitHub) und Version 4 der Spielseite.

**Automatische Tests (insgesamt 74, alle bestanden), neu:**
- Datenprüfung: Werte werden auf 1–10 begrenzt; Karten ohne Namen, mit falscher Seltenheit, fehlenden Werten oder unsicherer ID/Bild-ID werden verworfen
- Automatische IDs k001, k002 … ohne Kollision; Duplizieren (neue ID, „(Kopie)“, Entwurf); Stärke-Hinweis je Seltenheit
- Übernahme aller 100 vorhandenen Karten ohne Verlust (Namen und Werte identisch)
- Nur aktive Karten kommen ins Spiel (Tore, Packs, Gegner); Entwürfe/deaktivierte nicht; neue aktive Karten erscheinen
- Unter 30 aktiven Karten nutzt das Spiel die eingebauten Karten; der Gegner findet immer 8 Karten
- Deck-Reparatur, wenn Deckkarten deaktiviert werden; freigeschaltete Datenbank-Karten bleiben im Spielstand erhalten
- Datenbank (nachgebaut mit derselben Regel wie der Server): Admin speichert/lädt/ändert/löscht; **Nicht-Admins werden abgelehnt**; kaputte Dokumente werden übersprungen
- Bildzuschnitt auf 3:4 (Quer-, Hochformat, kleine Bilder)

**Browser-Durchlauf mit nachgebauter Plattform (Chromium):**
- Admin auf iPhone-Größe: 100 Karten übernehmen, Suche, Filter, neue Karte mit Bild-Upload, Werten, Beschreibung, Status Aktiv speichern, duplizieren, Duplikat löschen (gemeinsames Bild bleibt erhalten), neue Karte erscheint in der Sammlung des Spiels
- Admin am PC (1280 px): zweispaltiger Editor mit Live-Vorschau
- Normaler Spieler: kein Admin-Knopf, sieht die neue Karte im Spiel, direkter Schreibversuch über die Plattform wird abgelehnt, kein Zugriff auf den Bild-Speicher
- Kompletter Spiel-Durchlauf (Lauf, Münzwurf, Duell, Belohnung, Neuladen) unverändert ohne Fehler

**Nicht lokal testbar:** die echte claude.ai-Datenbank und der echte Bild-Speicher. Nach dem Veröffentlichen wurden die Kartendaten direkt in der echten Datenbank geprüft (siehe Abschluss-Nachricht).

## Version 1.3 (Feedback-Runde 3)

Änderungen: rechteckige Karten (3:4) mit Bildbereich, Seltenheit als Rahmenfarbe mit Leuchten/Glanz/Regenbogen, Münzwurf mit Wahl, Animationen beim Einsammeln, Legen, Kämpfen, Ergebnis und im Shop.

**Automatische Tests (insgesamt 51, alle bestanden)**
- Münzwurf: beide Seiten etwa gleich oft (2000 Würfe)
- Gewinnt der Computer den Münzwurf, lässt er dich beginnen (Simulation von 4000 Duellen: wer als Zweites legt, gewinnt etwa 4× so oft)
- Jeder Zug speichert alle Vergleiche (übernommen und gehalten) für die Kampfanimation

**Browser-Durchläufe (Chromium):** iPhone 390×844 und 375×667. Lauf mit Einsammel-Animation, Münzwurf (Werfen, Ergebnis, Wahl), Duell mit Vergleichs-Blasen und Übernahmen, Sieg mit Konfetti und neuer Karte, Niederlage, Shop (Pack-Öffnung, Skin-Kauf mit Stempel), Sammlung. Zusätzlich ein komplettes Duell mit „Animationen reduzieren“. Keine JavaScript-Fehler. Dabei gefundene und behobene Darstellungsfehler: Wert-Plaketten lagen über dem Ergebnis-Banner, Lichtstrahlen ragten aus dem Pack-Fenster, „NEU“ verdeckte den oberen Wert, der Siegbildschirm war oben abgeschnitten.

**Nicht getestet:** echte Geräte (Safari auf iPhone/iPad). Der drehende Regenbogenrahmen mystischer Karten braucht Safari 16.4 oder neuer; auf älteren Geräten bleibt er stehen.

## Version 1.2 (Feedback-Runde 2)

Änderungen: 100 Karten in 6 Seltenheiten (gewöhnlich, ungewöhnlich, selten, episch, legendär, mystisch) mit fester Stärke-Skala; Vorschau des nächsten Tors im Lauf; Gegner neu abgestimmt.

**Automatische Tests (insgesamt 48, alle bestanden)**
- 100 Karten mit eindeutigen IDs und Namen; jede Karte liegt im Stärkebereich ihrer Seltenheit; Anzahl je Seltenheit 30/24/20/14/8/4; jede höhere Seltenheit ist im Schnitt stärker
- Mystische Entdeckungen kommen bei etwa 1 % der Tore vor (16 000 simulierte Tore)
- Gegner ist ungefähr so stark wie das Starterdeck und bekommt nie mystische Karten
- Kampftests suchen sich passende Karten selbst und hängen nicht mehr von einzelnen Kartenwerten ab

**Balance-Simulation (2000 Duelle, nicht im Repo):** Zufällige Kartenwahl im Lauf gewinnt ca. 44 % (Version 1.1: 42 %), immer die stärkste Karte wählen gewinnt ca. 75 % (1.1: 84 %). Der Gegner ist damit etwa gleich schwer wie vorher.

**Browser-Durchlauf (Chromium, 390×844 und 375×667):** Vorschau des nächsten Tors gut lesbar, Sammlung zeigt 100 Karten und den Filter „Mystisch“, vollständiger Lauf und Duell ohne JavaScript-Fehler.

## Version 1.1 (Feedback-Runde 1)

Änderungen: Lauf langsamer (ca. 40 s statt 36 s), Stolpersteine schwächen die nächste Karte um 1, Kartenshop mit Booster-Packs und Skins.

**Neue automatische Tests (insgesamt 44, alle bestanden)**
- Geschwächte Karten: alle vier Werte −1, nie unter 1; die Schwächung zählt beim Angreifen und Verteidigen
- Stolperstein schwächt genau die nächste Karte; Ausweichen ergibt keine Schwächung (20 Läufe); immer in Steine laufen ergibt trotzdem 8 Karten mit höchstens −1
- Steine und Tore werden auch nach einem langen Ruckler in der richtigen Reihenfolge ausgewertet (dieser Fehler wurde durch den Test gefunden und behoben)
- Booster-Packs: 3 verschiedene Karten, Helden-Pack garantiert episch oder legendär (300 Packs), Münzabzug, Freischaltung, Erstattung für Doppelte, kein Kauf ohne genug Münzen, ganze Sammlung erreichbar
- Skins: Kauf, kein Doppelkauf, Ausrüsten nur wenn gekauft, Speichern/Laden, manipulierte Daten, alte Spielstände ohne Skins laden weiter

**Browser-Durchlauf (Chromium, iPhone-Größe):** Shop → Helden-Pack öffnen → zwei Skins kaufen → normaler Lauf (ca. 41 s inkl. Start) mit absichtlichem Stein-Treffer → geschwächte Karte (−1) im Duell sichtbar. Münzstand nach jedem Schritt korrekt, keine JavaScript-Fehler.

## MVP 1.0

### Automatische Tests (`npm test`, Vitest) – 28 Tests, alle bestanden

**Kampf (`tests/battle.test.ts`)**
- Vergleich in alle 4 Richtungen (oben/rechts/unten/links), jeweils für **alle 40×40 Kartenpaare**: Übernahme genau dann, wenn der eigene Wert strikt größer ist
- Gleichstand übernimmt nicht
- Keine diagonale Übernahme
- Keine Kettenreaktion
- Übernommene Karten wechseln nur den Besitzer, nicht den Platz
- Eigene Karten werden nie übernommen; belegte Felder sind nicht spielbar
- 50 vollständige Spiele mit je genau 16 Zügen (Computer gegen Computer): Brett voll, Hände leer, Punktsumme 16, Ergebnis korrekt
- 8:8 ergibt Unentschieden
- Der Computer wählt eine Übernahme, wenn eine möglich ist
- Die Computerhand hat 8 verschiedene Karten

**Runner (`tests/runner.test.ts`)**
- 8 Tore mit je 2 verschiedenen Deck-Karten und 1 Entdeckung außerhalb des Decks (30 Zufallsläufe)
- Genau 8 Auswahlen pro Lauf, egal wie gelenkt wird und bei normaler oder schneller Geschwindigkeit (30 Läufe); danach keine weiteren Auswahlen
- Die Karte der aktuellen Spur wird genommen
- Ein großer Zeitsprung und „Überspringen“ (auch doppelt) liefern genau 8 Karten
- Laufdauer bei normaler Geschwindigkeit: 30–45 Sekunden (seit 1.1: berechnet ca. 39,5 s plus 1 s Start)
- 40 Karten mit eindeutigen IDs und Namen, Werte 1–10

**Speichern & Belohnung (`tests/storage.test.ts`)**
- Neuer Spieler: 22 Karten freigeschaltet, gültiges 20er-Starterdeck
- Speichern und Laden von Sammlung, Deck und Münzen
- Beschädigte oder manipulierte Daten führen zu einem gültigen Spielstand
- Blockierter Speicher (z. B. privater Modus) bringt das Spiel nicht zum Absturz
- Deck-Prüfung: genau 20 verschiedene, freigeschaltete Karten
- Sieg schaltet höchstens eine (die seltenste) neue Entdeckung frei; eine bereits vorhandene Entdeckung gibt stattdessen Münzen; Unentschieden und Niederlage geben weniger Münzen und keine Karte

## Browser-Durchlauf (automatisiert mit Playwright/Chromium, nicht im Repo)
In iPhone-Größe (390×844 und 375×667) und iPad-Größe (820×1180) mit Touch-Emulation:
Hauptmenü → Sammlung → Deck → Lauf (Spurwechsel, schneller Modus, Überspringen) → vollständiges Duell mit 16 Zügen → Ergebnisbildschirm → Neuladen der Seite (Münzen und Statistik bleiben erhalten) → Aufgeben im Duell. Keine JavaScript-Fehler.

## Noch nicht getestet / offen
- **Nicht auf echtem iPhone/iPad in Safari getestet.** Die Tests liefen in Chromium mit simulierter Bildschirmgröße. Bitte auf deinen Geräten prüfen.
- Wischgesten wurden nur über die Buttons ◀ ▶ automatisiert getestet, Wischen per Finger noch nicht auf einem echten Gerät.
- Kein Ton, keine Musik.
- Balance (Kartenwerte, Stärke des Computers) ist ein erster Entwurf.
- Kein Konto und keine geräteübergreifende Sicherung (bewusst nicht im MVP).
