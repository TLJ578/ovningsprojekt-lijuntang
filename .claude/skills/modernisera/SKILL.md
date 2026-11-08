---
name: modernisera
description: Strukturerad modernisering av en äldre odokumenterad modul. Anrop: /modernisera <fil>
---

Du ska analysera och förbereda modernisering av: $Arguments

Följ dessa faser noggrant:
1. Analysera filen utan att ändra någon kod.
2. Skapa eller uppdatera `docs/codemap.md` med fasta rubriker: Syfte, In/Ut, Sidoeffekter, Antaganden, Risker.
3. Skriv minst 5 karakteriseringstester som fryser dagens faktiska beteende (inklusive eventuella kända egenheter/buggar).
4. Verifiera att alla karakteriseringstester är gröna innan refaktoreringssteg påbörjas.
5. Föreslå små refaktoreringssteg (ett steg i taget med grön testkörning efter varje).
