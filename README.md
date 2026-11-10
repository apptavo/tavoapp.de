# tavoapp.de

Öffentliche Website von Tavo (Netlify, vorher GitHub Pages). Reines HTML/CSS, kein Build. Enthält nur Website-Dateien, keine geheimen Schlüssel (in `share.js` und `netlify/edge-functions/share-meta.ts` steht nur die öffentliche Supabase-Adresse bzw. der öffentliche „publishable“ Schlüssel, der ohnehin im Browser sichtbar sein darf; was er lesen darf, regeln die Datenbankfunktionen).

`share.js` + `404.html` zeigen die Teilen-Seiten `/r/<name>-<id>`, `/u/<handle>`, `/l/<id>`, `/i/<handle>` (Einladung). Die Daten kommen über die öffentlichen Datenbankfunktionen `public_restaurant`, `public_profile`, `public_list`, `public_invite`.

**Link-Vorschau:** `netlify.toml` leitet diese Pfade mit Status 200 auf `404.html` um; die Edge Function `netlify/edge-functions/share-meta.ts` setzt vorher Open-Graph- und Twitter-Card-Tags ins HTML (Titel, Beschreibung, Vorschaubild 1200×630 von der Supabase-Funktion `link-preview`). Nicht öffentliche Inhalte → 404 mit allgemeinem Bild `og.jpg` (das haben auch die festen Seiten).

**Credits sparen (Netlify Free, 300 Credits/Monat, ein Deploy = 15 Credits):** Änderungen bündeln und zusammen pushen. Der `ignore`-Befehl in `netlify.toml` überspringt Deploys, wenn sich nur README & Co. geändert haben; `[skip netlify]` in der Commit-Nachricht überspringt einen Deploy ausdrücklich.
