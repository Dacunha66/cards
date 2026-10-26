# Testprotokoll

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
