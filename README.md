# tavoapp.de

Öffentliche Website von Tavo (GitHub Pages). Reines HTML/CSS, kein Build. Enthält nur Website-Dateien, keine geheimen Schlüssel (in `share.js` steht nur der öffentliche „publishable“ Schlüssel, der ohnehin im Browser sichtbar sein darf; was er lesen darf, regeln die Datenbankfunktionen).

`share.js` + `404.html` zeigen die Teilen-Seiten `/r/<name>-<id>`, `/u/<handle>`, `/l/<id>`, `/i/<handle>` (Einladung; GitHub Pages liefert unbekannte Adressen als `404.html` aus; sie lädt die Daten über die öffentlichen Datenbankfunktionen `public_restaurant`, `public_profile`, `public_list`, `public_invite`).

