/* InsydeLive "Offers & news" (step 32).
   Shows InsydeLive's own campaigns that are LIVE, inside their dates and set to "On the website".
   The database decides what is visible (row security); this page only reads. If anything fails, the section
   simply stays hidden - the rest of the page is never affected.
   Everything is shown with textContent (never as code), and only https links are used. */
(function () {
  'use strict';
  var host = location.hostname.replace(/^www\./, '');
  var isLive = host === 'insydelive.com';
  // Public "publishable" keys - safe to be in a web page (the same keys the app uses).
  var cfg = isLive
    ? { url: 'https://bjtialxcvyjdxwurysbv.supabase.co', key: 'sb_publishable_EcLKeK6058RCihb29GmZjA_HZPZ2air' }
    : { url: 'https://qefslvaqnakxgkmxxlsi.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZnNsdmFxbmFreGdrbXh4bHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjE4NDIsImV4cCI6MjA5OTkzNzg0Mn0.eOSpj0Del3K-8Oe2cEtlOEa3wrP1F2AaFS8gsibSymU' };

  var section = document.getElementById('offers');
  var list = document.getElementById('offers-list');
  if (!section || !list || !window.fetch) return;

  function safeHttps(u) {
    try { var p = new URL(u); return p.protocol === 'https:' ? p.href : null; } catch (e) { return null; }
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var headers = { apikey: cfg.key, Accept: 'application/json' };
  if (cfg.key.indexOf('eyJ') === 0) headers.Authorization = 'Bearer ' + cfg.key;
  var q = '/rest/v1/insyde_campaigns?select=id,title,body,button_label,button_url,flyer_url,terms_text,ends_at'
        + '&show_on_website=eq.true&status=eq.live&order=sort_order.asc,created_at.desc&limit=6';

  var ctrl = window.AbortController ? new AbortController() : null;
  if (ctrl) setTimeout(function () { ctrl.abort(); }, 8000);

  fetch(cfg.url + q, { headers: headers, signal: ctrl ? ctrl.signal : undefined, credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (rows) {
      var now = Date.now();
      rows = (Array.isArray(rows) ? rows : []).filter(function (c) { return c && c.title && new Date(c.ends_at).getTime() > now; });
      if (!rows.length) return;
      rows.forEach(function (c) {
        var card = el('article', 'offer');
        var flyer = c.flyer_url && safeHttps(c.flyer_url);
        if (flyer && flyer.indexOf(cfg.url + '/storage/') === 0) {
          var img = el('img', 'offer-flyer');
          img.src = flyer; img.alt = c.title + ' flyer'; img.loading = 'lazy'; img.decoding = 'async';
          card.appendChild(img);
        }
        var body = el('div', 'offer-body');
        body.appendChild(el('h3', 'offer-title', c.title));
        if (c.body) body.appendChild(el('p', 'offer-text', c.body));
        var link = c.button_label && c.button_url && safeHttps(c.button_url);
        if (link) {
          var a = el('a', 'btn offer-btn', c.button_label);
          a.href = link;
          if (new URL(link).hostname.replace(/^www\./, '') !== host) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
          body.appendChild(a);
        }
        if (c.terms_text) {
          var d = el('details', 'offer-terms');
          d.appendChild(el('summary', null, 'Terms apply'));
          d.appendChild(el('p', null, c.terms_text));
          body.appendChild(d);
        }
        card.appendChild(body);
        list.appendChild(card);
      });
      section.hidden = false;
    })
    .catch(function () { /* stay hidden */ });
})();
