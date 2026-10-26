# Testprotokoll – MVP 1.0

## Automatische Tests (`npm test`, Vitest) – 28 Tests, alle bestanden

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
- Laufdauer bei normaler Geschwindigkeit: 30–45 Sekunden (berechnet ca. 36 s plus 1 s Start)
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
- Münzen haben noch keinen Verwendungszweck (z. B. Shop), das ist eine spätere kreative Entscheidung.
- Kein Ton, keine Musik.
- Balance (Kartenwerte, Stärke des Computers) ist ein erster Entwurf.
- Kein Konto und keine geräteübergreifende Sicherung (bewusst nicht im MVP).
