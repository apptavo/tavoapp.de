/* Teilen-Seiten: tavoapp.de/r/<name>-<id> (Restaurant), /u/<handle> (Profil), /l/<id> (Liste).
   GitHub Pages kennt diese Adressen nicht als Dateien und liefert dafür 404.html aus – die rendert hier die richtige Seite.
   Daten kommen über drei öffentliche Datenbankfunktionen (public_restaurant / public_profile / public_list), die nur
   bereits öffentliche Felder liefern. Der Schlüssel unten ist der öffentliche „publishable“ Schlüssel (darf im Browser stehen). */
(function () {
  var SUPABASE_URL = 'https://lvfypkvaiextsmyrchxr.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_rNlkZjnGvqnfqYZUIKHNZg_u4ik2HkI';

  var CATEGORIES = {
    doener: ['Döner & Imbiss', 'Döner & snacks'], grill_turkish: ['Türkisch & Grill', 'Turkish & grill'],
    german: ['Deutsch & Brauhaus', 'German & brewery pub'], pizza: ['Italienisch & Pizza', 'Italian & pizza'],
    pasta: ['Pasta', 'Pasta'], burger: ['Burger', 'Burgers'], sushi: ['Sushi & Japanisch', 'Sushi & Japanese'],
    asian: ['Asiatisch & Wok', 'Asian & wok'], indian: ['Indisch', 'Indian'], greek: ['Griechisch', 'Greek'],
    mexican: ['Mexikanisch', 'Mexican'], oriental: ['Orientalisch & Falafel', 'Middle Eastern & falafel'],
    vegan: ['Vegan & Vegetarisch', 'Vegan & vegetarian'], cafe: ['Café', 'Café'],
    bakery_cafe: ['Bäckerei-Café', 'Bakery café'], breakfast: ['Frühstück & Brunch', 'Breakfast & brunch'],
    ice_cream: ['Eis', 'Ice cream'], dessert: ['Dessert & Kuchen', 'Dessert & cake'], bar: ['Bar mit Essen', 'Bar with food'],
    fish: ['Fisch', 'Fish'], steak: ['Steakhouse', 'Steakhouse'], chicken: ['Chicken', 'Chicken'],
    french: ['Französisch', 'French'], spanish: ['Spanisch & Tapas', 'Spanish & tapas'],
    sandwich: ['Sandwich & Bagel', 'Sandwich & bagel'], other: ['Sonstiges', 'Other']
  };

  /* Kleine Helfer: Text immer als Text einsetzen (nie als HTML) */
  function el(tag, cls, children) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    (children || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  /* Zweisprachiger Text (die Sprachumschaltung blendet data-l aus/ein) */
  function both(de, en, tag) {
    var wrap = document.createDocumentFragment();
    [['de', de], ['en', en]].forEach(function (p) {
      var s = el(tag || 'span', '', [p[1]]);
      s.setAttribute('data-l', p[0]);
      wrap.appendChild(s);
    });
    return wrap;
  }
  function category(key) {
    var c = CATEGORIES[key] || CATEGORIES.other;
    return both(c[0], c[1]);
  }
  function stars(value) {
    var pct = Math.min(Math.max(Math.round(value * 2) / 2, 0), 5) / 5 * 100;
    var fill = el('span', 'stars-fill', ['★★★★★']);
    fill.style.width = pct + '%';
    var s = el('span', 'stars', [el('span', 'stars-bg', ['★★★★★']), fill]);
    s.setAttribute('aria-hidden', 'true');
    return s;
  }
  function format(value, lang) { return value.toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }

  function rpc(name, args) {
    return fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
  }

  function openButton(href) {
    var a = el('a', 'open', []);
    a.href = href;
    a.appendChild(both('In der App öffnen', 'Open in the app'));
    var hint = el('p', 'store-hint', []);
    hint.appendChild(both('Bald im App Store & bei Google Play', 'Coming soon to the App Store & Google Play', 'span'));
    return el('div', 'open-box', [a, hint]);
  }

  function numbered(items) {
    var ol = el('ol', 'places');
    items.forEach(function (it) {
      var li = el('li', '', [el('b', '', [it.name]), el('span', 'muted', [' ']), el('span', 'muted', [category(it.category)])]);
      if (it.city) li.lastChild.appendChild(document.createTextNode(' · ' + it.city));
      ol.appendChild(li);
    });
    return ol;
  }

  function setTitle(text) { document.title = text + ' – Tavo'; }

  function notFound(main) {
    main.appendChild(el('div', 'card', [
      el('h1', '', [both('Nicht gefunden', 'Not found')]),
      el('p', '', [both('Diese Seite gibt es nicht (mehr) oder der Inhalt ist nicht öffentlich.', 'This page doesn’t exist (anymore) or the content isn’t public.')]),
      el('p', '', [(function () { var a = el('a', '', [both('Zur Startseite', 'Back to the homepage')]); a.href = '/'; return a; })()])
    ]));
  }

  function renderRestaurant(main, d) {
    setTitle(d.name);
    var lang = document.documentElement.lang || 'de';
    var street = [d.street, d.house_number].filter(Boolean).join(' ');
    var cityLine = [d.postal_code, d.city].filter(Boolean).join(' ');
    var address = [street, cityLine].filter(Boolean).join(', ');
    var card = el('div', 'card', [
      el('p', 'eyebrow', [both('Restaurant', 'Restaurant')]),
      el('h1', '', [d.name]),
      el('p', 'muted', [category(d.category)])
    ]);
    if (d.avg_rating != null && d.rating_count > 0) {
      var line = el('p', 'rating', [stars(d.avg_rating), el('b', '', [' ' + format(d.avg_rating, lang)])]);
      var count = el('span', 'muted', [' · ']);
      count.appendChild(both(d.rating_count + (d.rating_count === 1 ? ' Bewertung' : ' Bewertungen'), d.rating_count + (d.rating_count === 1 ? ' rating' : ' ratings')));
      line.appendChild(count);
      line.setAttribute('aria-label', format(d.avg_rating, lang) + ' / 5');
      card.appendChild(line);
    } else {
      card.appendChild(el('p', 'muted', [both('Noch keine Bewertungen', 'No ratings yet')]));
    }
    if (address) card.appendChild(el('p', '', [address]));
    card.appendChild(openButton('tavo://restaurant/' + encodeURIComponent(d.id)));
    main.appendChild(card);
  }

  function renderProfile(main, d, handle) {
    setTitle(d.display_name);
    var card = el('div', 'card', [
      el('p', 'eyebrow', [both('Profil', 'Profile')]),
      el('h1', '', [d.display_name + (d.is_verified_blogger ? ' ✓' : '')]),
      el('p', 'muted', ['@' + d.handle])
    ]);
    card.appendChild(el('h2', '', [both('Lieblingsläden', 'Favorite spots')]));
    if (d.favorites.length) card.appendChild(numbered(d.favorites));
    else card.appendChild(el('p', 'muted', [both('Noch keine Lieblingsläden', 'No favorite spots yet')]));
    card.appendChild(openButton('tavo://u/' + encodeURIComponent(d.handle || handle)));
    main.appendChild(card);
  }

  function renderList(main, d, id) {
    setTitle(d.title);
    var author = el('p', 'muted', []);
    author.appendChild(both('Liste von ', 'List by '));
    author.appendChild(document.createTextNode(d.author_name + ' (@' + d.author_handle + ')'));
    var card = el('div', 'card', [el('p', 'eyebrow', [both('Liste', 'List')]), el('h1', '', [d.title]), author]);
    if (d.description) card.appendChild(el('p', '', [d.description]));
    if (d.items.length) card.appendChild(numbered(d.items));
    else card.appendChild(el('p', 'muted', [both('Diese Liste ist noch leer.', 'This list is empty.')]));
    card.appendChild(openButton('tavo://list/' + encodeURIComponent(id)));
    main.appendChild(card);
  }

  function run() {
    var main = document.getElementById('view');
    if (!main) return;
    var m = location.pathname.match(/^\/(r|u|l)\/([^\/]+)\/?$/);
    if (!m) { notFound(main); return; }
    var kind = m[1];
    var raw = decodeURIComponent(m[2]);
    var call;
    if (kind === 'r') call = rpc('public_restaurant', { p_id: raw.split('-').pop() }).then(function (d) { if (!d) return false; renderRestaurant(main, d); return true; });
    else if (kind === 'u') call = rpc('public_profile', { p_handle: raw }).then(function (d) { if (!d) return false; renderProfile(main, d, raw); return true; });
    else call = rpc('public_list', { p_id: raw }).then(function (d) { if (!d) return false; renderList(main, d, raw); return true; });
    main.textContent = '';
    main.appendChild(el('p', 'muted', [both('Lädt …', 'Loading …')]));
    call.then(function (rendered) {
      var loading = main.firstChild;
      if (loading && loading.className === 'muted') main.removeChild(loading);
      if (!rendered) notFound(main);
    }).catch(function (err) { if (window.console) console.error(err);
      main.textContent = '';
      main.appendChild(el('div', 'card', [el('p', '', [both('Das Laden hat nicht geklappt. Bitte versuche es später noch einmal.', 'Loading failed. Please try again later.')])]));
    });
  }

  document.addEventListener('DOMContentLoaded', run);
})();
