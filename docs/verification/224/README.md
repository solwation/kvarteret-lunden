# #224 Mörkare sommarkronor, större storleksspridning och tätare ådal

Källa: `solwation/lunden-3d-apartment` `c34d9a0e` (original #1804).

Chromium med SwiftShader, 1280x720, fast datum, samma kamera före och efter (från (-60, 24, 50) mot ådalen respektive från (-20, 30, 60) västerut). Gränssnittet syns i bilderna.

- `fore-dal-sommar.png` / `efter-dal-sommar.png` (juli): kronorna går från ljust gulgrönt till mörkt blågrönt.
- `fore-dal-ost.png` / `efter-dal-ost.png` (juli): ådalen med mörkare, mer varierade kronor och tätare bestånd.
- `fore-dal-host.png` / `efter-dal-host.png` (oktober) och `fore-dal-vinter.png` / `efter-dal-vinter.png` (januari): höst och vinter ser likadana ut som förut (samma månadsvärden); vintervyn visar de kala träden och snön.

Mätt i samma vyer: trädkronor 2208 -> 2244 instanser (36 nya, endast dator); `tree-crowns` 21 och `tree-trunks` 20 InstancedMesh före och efter. Ritanrop: ådalen sommar 69 -> 71 (kulling, nya träd hamnar i fler celler i vyn), ådalen väster 99 -> 99, vinter 69 -> 69. Mobilläge (`?lowmem`): 2208 instanser och 86 -> 86 ritanrop, alltså inga nya träd. Ingen fysisk enhet.
