/* Altus Colour Palette Generator — UI wiring. Requires PaletteLogic (assets/palette-logic.js). */
(function () {
    'use strict';
    var P = window.PaletteLogic;
    if (!P) return;

    function $(id) { return document.getElementById(id); }
    var els = {};
    ['cpg-base-color', 'cpg-base-hex', 'cpg-scheme', 'cpg-style', 'cpg-biz',
     'cpg-generate', 'cpg-surprise', 'cpg-error', 'cpg-results',
    ].forEach(function (id) { els[id] = $(id); });
    if (!els['cpg-generate']) return;

    var current = null; // {palette, cssText, txtReport}

    var SCHEME_LABELS = {
        brand: 'Brand blend (recommended)',
        complementary: 'Complementary (high contrast)',
        analogous: 'Analogous (harmonious)',
        triadic: 'Triadic (balanced energy)',
        monochrome: 'Monochrome (one colour, many tones)'
    };
    var STYLE_LABELS = {
        professional: 'Professional',
        vibrant: 'Vibrant',
        soft: 'Soft & friendly',
        bold: 'Bold & dark'
    };

    function fillSelect(el, labels, order) {
        order.forEach(function (k) {
            var o = document.createElement('option');
            o.value = k; o.textContent = labels[k];
            el.appendChild(o);
        });
    }
    fillSelect(els['cpg-scheme'], SCHEME_LABELS, P.SCHEMES);
    fillSelect(els['cpg-style'], STYLE_LABELS, P.STYLES);

    els['cpg-base-color'].addEventListener('input', function (e) {
        els['cpg-base-hex'].value = e.target.value;
    });
    els['cpg-base-hex'].addEventListener('input', function (e) {
        var n = P.normHex(e.target.value);
        if (n) els['cpg-base-color'].value = n;
    });

    function showError(msg) {
        var e = els['cpg-error'];
        e.textContent = msg; e.hidden = false;
        e.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    function hideError() { els['cpg-error'].hidden = true; }

    function copyText(text, btn) {
        function done() {
            var old = btn.textContent;
            btn.textContent = 'Copied ✓';
            setTimeout(function () { btn.textContent = old; }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () { fallback(); });
        } else { fallback(); }
        function fallback() {
            var ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); done(); } catch (err) { /* noop */ }
            document.body.removeChild(ta);
        }
    }

    function contrastBadge(s) {
        var label, cls;
        if (s.level === 'AA') { label = 'White/black text ✓ AA (' + s.ratio + ':1)'; cls = 'aa'; }
        else if (s.level === 'AA-large') { label = 'Large text ✓ (' + s.ratio + ':1)'; cls = 'aal'; }
        else { label = 'Decorative only (' + s.ratio + ':1)'; cls = 'dec'; }
        return '<span class="cpg-contrast ' + cls + '" title="Best text colour on this swatch: ' + s.text + '">' + label + '</span>';
    }

    function render(palette) {
        var html = '';
        html += '<h3 class="cpg-rh">Your brand palette</h3>';
        html += '<p class="cpg-meta">Scheme: <strong>' + esc(palette.scheme) + '</strong> &nbsp;·&nbsp; Style: <strong>' + esc(palette.styleLabel) + '</strong> &nbsp;·&nbsp; Base: <strong>' + esc(palette.base) + '</strong></p>';
        html += '<div class="cpg-swatches">';
        palette.swatches.forEach(function (s, i) {
            html += '<div class="cpg-swatch">'
                + '<div class="cpg-chip" style="background:' + s.hex + '"></div>'
                + '<div class="cpg-sinfo">'
                + '<div class="cpg-sname">' + esc(s.name) + '</div>'
                + '<div class="cpg-suse">' + esc(s.uses) + '</div>'
                + '<div class="cpg-hexrow"><span class="cpg-hex">' + s.hex + '</span>'
                + '<button type="button" class="cpg-copy" data-copy="' + s.hex + '">Copy</button></div>'
                + contrastBadge(s)
                + '</div></div>';
        });
        html += '</div>';

        html += '<h3 class="cpg-rh">CSS variables — ready for your website</h3>';
        html += '<div class="cpg-codewrap"><pre class="cpg-code" id="cpg-css-code">' + esc(current.cssText) + '</pre></div>';
        html += '<div class="cpg-codebar">'
            + '<button type="button" class="cpg-btn-ghost" id="cpg-copy-css">Copy CSS</button>'
            + '<button type="button" class="cpg-btn-ghost" id="cpg-dl-css">Download palette.css</button>'
            + '<button type="button" class="cpg-btn-ghost" id="cpg-dl-txt">Download report (.txt)</button>'
            + '</div>';

        html += '<h3 class="cpg-rh">How to use these six colours</h3>';
        html += '<ul class="cpg-guide">'
            + '<li><strong>Primary</strong> is your brand colour. It goes on your logo, main buttons and headlines — it is the colour people should remember.</li>'
            + '<li><strong>Secondary</strong> supports it: sub-headings, icons and secondary buttons. Pair Primary + Secondary in your hero section.</li>'
            + '<li><strong>Accent</strong> is for the moments that matter: prices, “Book now” buttons and badges. Because it is used rarely, it grabs attention.</li>'
            + '<li><strong>Dark</strong> handles footers and body text. <strong>Light</strong> is your calm background. <strong>Neutral</strong> is for borders and quiet text.</li>'
            + '<li>Rule of thumb: 60% Light backgrounds, 30% Primary/Secondary, 10% Accent. Check the contrast badge before putting text on any colour.</li>'
            + '</ul>';

        els['cpg-results'].innerHTML = html;
        els['cpg-results'].hidden = false;

        els['cpg-results'].querySelectorAll('[data-copy]').forEach(function (b) {
            b.addEventListener('click', function () { copyText(b.getAttribute('data-copy'), b); });
        });
        $('cpg-copy-css').addEventListener('click', function () { copyText(current.cssText, $('cpg-copy-css')); });
        $('cpg-dl-css').addEventListener('click', function () {
            download('brand-palette.css', current.cssText, 'text/css');
        });
        $('cpg-dl-txt').addEventListener('click', function () {
            download('brand-palette-report.txt', current.txtReport, 'text/plain');
        });

        els['cpg-results'].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function download(filename, text, mime) {
        var blob = new Blob([text], { type: mime + ';charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    }

    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function generate(baseOverride) {
        hideError();
        var base = baseOverride || P.normHex(els['cpg-base-hex'].value);
        if (!base) { showError('Please enter a valid colour — pick one from the colour box or type a hex code like #2e6bff.'); return; }
        var scheme = els['cpg-scheme'].value;
        var style = els['cpg-style'].value;
        var biz = els['cpg-biz'].value.trim();
        var palette = P.buildPalette(base, scheme, style);
        if (!palette) { showError('Something went wrong with that colour. Try another one.'); return; }
        var prefix = biz.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'brand';
        current = {
            palette: palette,
            cssText: P.paletteCss(palette, prefix),
            txtReport: P.paletteText(palette, biz)
        };
        render(palette);
    }

    els['cpg-generate'].addEventListener('click', function () { generate(); });
    els['cpg-surprise'].addEventListener('click', function () {
        var r = P.randomBase();
        els['cpg-base-color'].value = r;
        els['cpg-base-hex'].value = r;
        generate(r);
    });

})();
