# Project Card Rush

Ein mobiles Browserspiel für iPhone und iPad (Hochformat): Du **rennst** durch 8 Tore, **sammelst** 8 Karten und trittst dann in einem **4×4-Kartenduell** gegen den Computer an.

> Stand: MVP 1.0, erster spielbarer Prototyp. Alle Namen, Karten und Grafiken sind eigene Platzhalter (Emoji + Farbverlauf).

---

## Für dich (ohne Programmierkenntnisse)

### Spielen
1. Öffne auf dem iPhone/iPad den **Vorschau-Link**, den Claude dir im Chat geschickt hat, in **Safari**.
2. Halte das Gerät **hochkant**.
3. Tippe auf **▶ Spielen**.

Tipp: In Safari über **Teilen → „Zum Home-Bildschirm“** bekommst du ein App-Symbol.

### So funktioniert das Spiel
- **Lauf:** Die Figur rennt von allein. **Wische** nach links/rechts oder tippe **◀ ▶**. In jedem der 8 Tore nimmst du die Karte auf deiner Spur. Oben im Himmel siehst du das **nächste Tor** groß mit allen Werten; die Karte deiner Spur ist weiß umrandet.
  - Silberner Rahmen = Karte aus deinem Deck
  - Goldener Rahmen mit **NEU** = Entdeckung aus dem restlichen Kartenpool
  - **Stolpersteine:** Läufst du in einen Stein, ist die **nächste Karte** im Duell um 1 schwächer (alle vier Werte, mindestens 1). Du erkennst sie am roten „−1“.
  - **⏩** = 3× schneller, **⏭ Überspringen** = sofort alle Tore auf der aktuellen Spur nehmen
- **Münzwurf:** Vor jedem Duell wird eine Münze geworfen. Gewinnst du, wählst du, wer beginnt (Tipp: Wer die letzte Karte legt, hat oft einen Vorteil).
- **Duell:** Tippe eine Handkarte an, dann ein freies Feld. Ist dein Wert auf der Seite zur gegnerischen Nachbarkarte **höher**, gehört sie dir. Nach 16 Zügen gewinnt, wer mehr Felder hat.
- **Belohnung:** Sieg = 🪙 100 und die seltenste neue Entdeckung wird freigeschaltet. Unentschieden = 🪙 40. Niederlage = 🪙 15.
- **Shop:** Mit Münzen kaufst du **Booster-Packs** (Abenteurer-Pack 🪙 150, Helden-Pack 🪙 400 mit garantierter epischer oder legendärer Karte) und **Skins** (Kartenfarbe im Duell, Figur im Lauf). Doppelte Karten aus Packs werden in Münzen umgetauscht.
- **Karten:** 100 Karten in 6 Seltenheiten. Je seltener, desto stärker (Summe der vier Werte): gewöhnlich 13–16, ungewöhnlich 17–19, selten 20–22, episch 23–25, legendär 26–28, **mystisch 29–32** (sehr selten, Regenbogen-Rahmen).
- **Sammlung / Deck bearbeiten:** Das Deck braucht genau 20 verschiedene Karten.

### Wichtig zum Spielstand
Dein Fortschritt wird **nur in diesem Browser auf diesem Gerät** gespeichert (localStorage). Es gibt kein Konto. Das heißt:
- iPhone und iPad haben **getrennte** Spielstände.
- Wenn du in Safari die **Website-Daten löschst** oder im **privaten Modus** spielst, ist der Fortschritt weg.

### Feedback geben
Schreib Claude einfach im Chat, was dir gefällt oder was anders sein soll, zum Beispiel: „Der Lauf ist zu langsam“ oder „Ich möchte mehr legendäre Karten“. Screenshots helfen.

---

## Technik (für Entwickler)

- TypeScript, React 18, Vite 6, Vitest. Kein Backend.
- Spiellogik ohne UI in `src/game/` (Kampfregeln `battle.ts`, Computergegner `ai.ts`, Runner `runner.ts`, Speichern `storage.ts`, Belohnungen `rewards.ts`, Shop `shop.ts`, Skins `skins.ts`, 40 Karten `cards.ts`).
- Bildschirme in `src/screens/`, der Runner zeichnet per Canvas (Pseudo-3D). Animationshelfer (Partikel, Konfetti, hochzählende Zahlen) in `src/components/Effects.tsx`.
- Karten sind hochkant im Format 3:4. Für ein echtes Kartenbild bei der Karte in `src/game/cards.ts` das Feld `image` setzen (URL oder data-URI); das Bild ersetzt dann das Emoji.

```bash
npm install
npm run dev           # Entwicklungsserver
npm test              # automatische Tests
npm run build         # normaler Build nach dist/
npm run build:single  # alles in EINER HTML-Datei (dist-single/index.html) für die gehostete Vorschau
```

Bei jedem Push laufen Typprüfung, Tests und Build automatisch über GitHub Actions (`.github/workflows/ci.yml`).

Was getestet ist und was noch offen ist, steht in [TESTING.md](TESTING.md).
