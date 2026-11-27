# Public #344: ändparen vilar vid stranden på natten

Publik bas `a08a6f3`, granskad originalkälla `a5983bfa86849660315b1f2bbcfd1f5a9226463c`
([original #2202](https://github.com/solwation/lunden-3d-apartment/issues/2202)); endast den neutrala dygnsrytmen.
Egna bilder från `tools/ducklife344browser.cjs` i den riktiga publika appen (1120×800, SwiftShader, `?month=6&nocats`, fast lokal klocka);
före = basens moduler serverade i stället för de nya. Flocken stegas 600 s med observatören vid första paret. [Browserdata](browser.json).

- [before/night-before.jpg](https://raw.githubusercontent.com/solwation/kvarteret-lunden/baecd3b97c91153ad94abd8494fdad954934da26/docs/verification/344/before/night-before.jpg): före, kl 23: paret simmar/går som på dagen.
- [night.jpg](night.jpg): efter, kl 23: paret vilar torrt på stranden, kroppen lätt sänkt och framåtlutad.
- [day.jpg](day.jpg): efter, kl 12: oförändrad dagrörelse.

Resultat: kl 23 vilar alla fyra torrt på stödd mark (`sleeping`, ej simmande/gående), kl 12 och 08 är alla vakna;
29 draws i alla lägen (triangeldifferens <1 % är bara frustumurval); `Ducks.update` ≈0,15 ms; inga externa anrop, lagring orörd.
