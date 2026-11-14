/* Altus Colour Palette Generator — pure colour logic.
 * No DOM access. Safe to require() in Node for tests and to load in the browser. */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.PaletteLogic = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var SCHEMES = ['brand', 'complementary', 'analogous', 'triadic', 'monochrome'];
    var STYLES  = ['professional', 'vibrant', 'soft', 'bold'];

    /* ---------------- parsing & conversion ---------------- */

    function normHex(hex) {
        if (typeof hex !== 'string') return null;
        var h = hex.trim().replace(/^#/, '');
        if (/^[0-9a-fA-F]{3}$/.test(h)) {
            h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        }
        if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
        return '#' + h.toLowerCase();
    }

    function hexToRgb(hex) {
        var n = normHex(hex);
        if (!n) return null;
        return {
            r: parseInt(n.slice(1, 3), 16),
            g: parseInt(n.slice(3, 5), 16),
            b: parseInt(n.slice(5, 7), 16)
        };
    }

    function rgbToHex(r, g, b) {
        function c(v) { v = Math.round(Math.max(0, Math.min(255, v))); return ('0' + v.toString(16)).slice(-2); }
        return '#' + c(r) + c(g) + c(b);
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                default: h = (r - g) / d + 4;
            }
            h *= 60;
        }
        return { h: h, s: s * 100, l: l * 100 };
    }

    function hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
        var r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            var hk = h / 360;
            var tc = [hk + 1 / 3, hk, hk - 1 / 3];
            var out = [];
            for (var i = 0; i < 3; i++) {
                var t = tc[i];
                if (t < 0) t += 1; if (t > 1) t -= 1;
                var v;
                if (t < 1 / 6) v = p + (q - p) * 6 * t;
                else if (t < 1 / 2) v = q;
                else if (t < 2 / 3) v = p + (q - p) * (2 / 3 - t) * 6;
                else v = p;
                out.push(v);
            }
            r = out[0]; g = out[1]; b = out[2];
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    function hexToHsl(hex) {
        var rgb = hexToRgb(hex);
        if (!rgb) return null;
        return rgbToHsl(rgb.r, rgb.g, rgb.b);
    }

    function hslToHex(h, s, l) {
        var rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    /* ---------------- transforms ---------------- */

    function rotateHue(hex, deg) {
        var hsl = hexToHsl(hex);
        if (!hsl) return null;
        return hslToHex(hsl.h + deg, hsl.s, hsl.l);
    }

    // mix t in [0..1] from hexA toward hexB
    function mixHex(hexA, hexB, t) {
        var a = hexToRgb(hexA), b = hexToRgb(hexB);
        if (!a || !b) return null;
        t = Math.max(0, Math.min(1, t));
        return rgbToHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
    }

    function tint(hex, t) { return mixHex(hex, '#ffffff', t); }   // toward white
    function shade(hex, t) { return mixHex(hex, '#000000', t); }  // toward black

    /* ---------------- contrast (WCAG 2.x) ---------------- */

    function luminance(hex) {
        var rgb = hexToRgb(hex);
        if (!rgb) return null;
        function lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
        return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
    }

    function contrastRatio(hexA, hexB) {
        var l1 = luminance(hexA), l2 = luminance(hexB);
        if (l1 === null || l2 === null) return null;
        if (l1 < l2) { var t = l1; l1 = l2; l2 = t; }
        return (l1 + 0.05) / (l2 + 0.05);
    }

    // returns {text:'#ffffff'|'#111111', ratio:number, level:'AA'|'AA-large'|'decorative'}
    function bestText(hex) {
        var w = contrastRatio(hex, '#ffffff'), k = contrastRatio(hex, '#101418');
        if (w === null) return null;
        var useWhite = w >= k;
        var ratio = useWhite ? w : k;
        var level = ratio >= 4.5 ? 'AA' : (ratio >= 3 ? 'AA-large' : 'decorative');
        return { text: useWhite ? '#ffffff' : '#101418', ratio: Math.round(ratio * 100) / 100, level: level };
    }

    /* ---------------- palette builder ---------------- */

    var SCHEME_OFFSETS = {
        brand:         { secondary: -155, accent: 35 },
        complementary: { secondary: 180,  accent: -35 },
        analogous:     { secondary: -40,   accent: 80 },
        triadic:       { secondary: 120,   accent: 240 },
        monochrome:    { secondary: 0,     accent: 0 }
    };

    var STYLE_ADJUST = {
        professional: { sMul: 0.72, lShift: -4,  label: 'Professional' },
        vibrant:      { sMul: 1.28, lShift: 4,   label: 'Vibrant' },
        soft:         { sMul: 0.62, lShift: 16,  label: 'Soft & friendly' },
        bold:         { sMul: 1.12, lShift: -14, label: 'Bold & dark' }
    };

    var ROLE_USES = {
        primary:   'Main brand colour — logo, buttons, headlines, links',
        secondary: 'Support colour — sub-headings, icons, secondary buttons, section accents',
        accent:    'Highlight colour — calls to action, prices, badges, hover states. Use sparingly',
        dark:      'Dark tone — footers, dark sections, body text on light backgrounds',
        light:     'Light tone — page backgrounds, cards, dividers, subtle panels',
        neutral:   'Neutral grey — borders, muted text, form fields, backgrounds'
    };

    function applyStyle(hex, style) {
        var adj = STYLE_ADJUST[style] || STYLE_ADJUST.professional;
        var hsl = hexToHsl(hex);
        if (!hsl) return null;
        var s = Math.max(6, Math.min(95, hsl.s * adj.sMul));
        var l = Math.max(8, Math.min(90, hsl.l + adj.lShift));
        return hslToHex(hsl.h, s, l);
    }

    function buildPalette(baseHex, scheme, style) {
        var base = normHex(baseHex);
        if (!base) return null;
        if (SCHEMES.indexOf(scheme) === -1) scheme = 'brand';
        if (STYLES.indexOf(style) === -1) style = 'professional';

        var primary = applyStyle(base, style);
        var off = SCHEME_OFFSETS[scheme];

        var secondary, accent;
        if (scheme === 'monochrome') {
            var hsl = hexToHsl(primary);
            secondary = hslToHex(hsl.h, Math.max(8, hsl.s * 0.55), Math.max(10, hsl.l - 22));
            accent    = hslToHex(hsl.h, Math.min(90, hsl.s * 1.15), Math.min(80, hsl.l + 24));
        } else {
            secondary = rotateHue(primary, off.secondary);
            accent = rotateHue(primary, off.accent);
            var aHsl = hexToHsl(accent);
            accent = hslToHex(aHsl.h, Math.min(92, aHsl.s * 1.2 + 6), Math.max(38, Math.min(62, aHsl.l)));
        }

        var dark    = shade(primary, 0.62);
        var light   = tint(primary, 0.88);
        var dHsl    = hexToHsl(dark);
        var neutral = hslToHex(dHsl.h, Math.max(4, dHsl.s * 0.25), Math.min(88, Math.max(55, dHsl.l + 52)));

        var defs = [
            { name: 'Primary',   role: 'primary',   hex: primary },
            { name: 'Secondary', role: 'secondary', hex: secondary },
            { name: 'Accent',    role: 'accent',    hex: accent },
            { name: 'Dark',      role: 'dark',      hex: dark },
            { name: 'Light',     role: 'light',     hex: light },
            { name: 'Neutral',   role: 'neutral',   hex: neutral }
        ];

        // guarantee unique hexes (edge: near-black bases) — nudge lightness until unique
        var seen = {};
        defs.forEach(function (d) {
            var guard = 0;
            while (seen[d.hex] && guard < 12) {
                var h = hexToHsl(d.hex);
                d.hex = hslToHex(h.h + 4, h.s, Math.min(92, h.l + 3));
                guard++;
            }
            seen[d.hex] = true;
            var t = bestText(d.hex);
            d.rgb = hexToRgb(d.hex);
            d.text = t.text;
            d.ratio = t.ratio;
            d.level = t.level;
            d.uses = ROLE_USES[d.role];
        });

        return {
            base: base,
            scheme: scheme,
            style: style,
            styleLabel: STYLE_ADJUST[style].label,
            swatches: defs
        };
    }

    /* ---------------- exports ---------------- */

    function varName(prefix, role) {
        return '--' + prefix + '-' + role;
    }

    function paletteCss(palette, prefix) {
        prefix = (prefix || 'brand').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'brand';
        var lines = [':root {'];
        palette.swatches.forEach(function (s) {
            var rgb = s.rgb;
            lines.push('  ' + varName(prefix, s.role) + ': ' + s.hex + '; /* ' + s.name + ' — rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ') */');
        });
        lines.push('}');
        lines.push('');
        lines.push('/* Example usage */');
        lines.push('.btn-primary { background: var(' + varName(prefix, 'primary') + '); color: #fff; }');
        lines.push('.btn-accent  { background: var(' + varName(prefix, 'accent') + '); color: #fff; }');
        lines.push('body { background: var(' + varName(prefix, 'light') + '); color: var(' + varName(prefix, 'dark') + '); }');
        return lines.join('\n');
    }

    function paletteText(palette, businessName) {
        var lines = [];
        lines.push('YOUR BRAND COLOUR PALETTE');
        if (businessName) lines.push('Prepared for: ' + businessName);
        lines.push('Scheme: ' + palette.scheme + ' · Style: ' + palette.styleLabel);
        lines.push('Generated by the free Altus Colour Palette Generator');
        lines.push('');
        palette.swatches.forEach(function (s) {
            lines.push(s.name.toUpperCase() + '  ' + s.hex + '  (rgb ' + s.rgb.r + ', ' + s.rgb.g + ', ' + s.rgb.b + ')');
            lines.push('  Use for: ' + s.uses);
            lines.push('  Best text on it: ' + s.text + ' (contrast ' + s.ratio + ':1' + (s.level === 'AA' ? ' — passes WCAG AA' : s.level === 'AA-large' ? ' — OK for large text' : ' — decorative only') + ')');
        });
        lines.push('');
        lines.push('CSS variables: paste the CSS file into your site or hand it to your web designer.');
        lines.push('Free tool: https://altuswebsolutions.com/tools/colour-palette-generator/');
        return lines.join('\n');
    }

    function randomBase() {
        var h = Math.floor(Math.random() * 360);
        var s = 45 + Math.floor(Math.random() * 40);
        var l = 32 + Math.floor(Math.random() * 28);
        return hslToHex(h, s, l);
    }

    return {
        SCHEMES: SCHEMES,
        STYLES: STYLES,
        normHex: normHex,
        hexToRgb: hexToRgb,
        rgbToHex: rgbToHex,
        rgbToHsl: rgbToHsl,
        hslToRgb: hslToRgb,
        hexToHsl: hexToHsl,
        hslToHex: hslToHex,
        rotateHue: rotateHue,
        mixHex: mixHex,
        tint: tint,
        shade: shade,
        luminance: luminance,
        contrastRatio: contrastRatio,
        bestText: bestText,
        buildPalette: buildPalette,
        paletteCss: paletteCss,
        paletteText: paletteText,
        randomBase: randomBase
    };
}));