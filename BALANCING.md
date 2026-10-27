# Balancing – Ergebnisse und Entscheidungen

Alle Zahlen stammen aus automatischen Testpartien mit dem echten Kartenbestand (101 Karten, Stand 27.10.2026).
„Einfach“ = gieriger Computerspieler, „Vorausschauend“ = Computerspieler, der die beste Antwort des Gegners einrechnet.
Menschen spielen anders – die Zahlen zeigen Richtungen, keine exakten Werte.

## Startvorteil im Duell

| Variante | Spielstärke | Startspieler | Zweiter | Unentschieden |
|---|---|---|---|---|
| Standard (16 Felder) | einfach | 20,3 % | 60,0 % | 19,8 % |
| Standard (16 Felder) | vorausschauend | 23,5 % | 52,8 % | 23,7 % |
| Startbonus +1 Punkt | einfach / vorausschauend | 40,1 % / 47,2 % | 60,0 % / 52,8 % | 0 % |
| Startbonus +3 Punkte | einfach / vorausschauend | 62,9 % / 69,5 % | 37,1 % / 30,5 % | 0 % |
| **Felsfeld (15 Felder)** | einfach / vorausschauend | **43,9 % / 53,3 %** | **56,1 % / 46,7 %** | **0 %** |

**Entscheidung:** In der Collection League blockiert in jedem Duell ein zufälliger Fels ein Feld.
Der Startspieler legt dann die letzte Karte; je nach Spielstärke liegt er knapp über oder unter 50 %, und
ein Unentschieden ist unmöglich. Das Abenteuer behält vorerst die alten Regeln (16 Felder).

## Match-Format (Collection League)

Zwei Runden mit derselben Hand und getauschtem Start. 2:0 gewinnt, bei 1:1 entscheidet ein Entscheidungsduell
(neuer Münzwurf, Felsfeld). Automatischer Test: Im Entscheidungsduell gewinnt der Startspieler 40–60 % (bestanden).

## Deckregeln (Collection League)

20 Karten, höchstens 2 gleiche, höchstens 1 legendäre, 1 mystische und 4 epische Karten.

## Karten-Stärke

Siegquote einer Karte in zufälligen Händen: gewöhnlich 34 %, ungewöhnlich 38 %, selten 43 %, episch 45 %,
legendär 46 %, mystisch 48 %. „Alba“ (vorher 9/9/9/9, Σ 36, stärkste Karte) wurde auf 8/7/8/7 (Σ 30) gesetzt.

## Faire Lauf-Angebote

Ein Match-Seed erzeugt alles Zufällige; vor dem Match wird nur sein SHA-256-Fingerabdruck gezeigt.
Deckkarten werden wie von einem gemischten Stapel gezogen (2 pro Tor, 16 von 20), die neutrale Entdeckung ist für
beide Spieler gleich (gewöhnlich bis selten, Σ 17–21). Steine sind für beide Spieler identisch.
Spurwechsel werden aufgezeichnet; der Lauf lässt sich exakt nachspielen (Grundlage für die Server-Prüfung).
