=== Altus Colour Palette Generator ===
Contributors: altuswebsolutions-official
Tags: colour palette generator, brand colours, hex codes, wcag contrast, small business branding
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Build a complete 6-colour brand palette from any base colour — hex codes, WCAG contrast badges and ready-to-paste CSS. Free, no account.

== Description ==

Pick a base colour — your logo colour, your favourite, anything — and get a complete 6-colour brand palette in seconds: Primary, Secondary and Accent, plus Dark, Light and Neutral tones, each with its hex code, a plain-English usage note, and a WCAG contrast badge telling you whether text is safe on that colour.

Use the shortcode `[altus_colour_palette_generator]` on any page.

Choose from five colour schemes (Brand blend, Complementary, Analogous, Triadic, Monochrome) and four brand styles (Professional, Vibrant, Soft & friendly, Bold & dark) — 20 combinations in total. Every palette is deterministic: the same base colour, scheme and style always give the same six colours, so you can reproduce a palette exactly.

Click any hex code to copy it, copy the ready-to-paste CSS variables (`--brand-primary` and friends) into your site, or download the palette as `palette.css` or a plain-text report to hand to your designer. A built-in "How to use these six colours" guide explains the 60-30-10 rule — 60% light backgrounds, 30% brand colours, 10% accent — so the palette actually gets used properly. The "Surprise me" button generates a random palette when you want inspiration instead of a starting colour.

Colour math is standard colour theory: HSL transforms, complementary / analogous / triadic hue offsets, tints and shades, and WCAG 2.x contrast ratios (white-on-black = 21:1). Badges read AA (body text is comfortably readable), Large text (fine for big headings) or Decorative only (don't put readable text on that colour).

Everything runs in the visitor's browser — nothing entered leaves their device. No account, no third-party libraries.

This open-source version contains NO lead capture, NO email sending, and NO data storage. Results are shown on screen only. The version hosted on altuswebsolutions.com may offer email delivery; this open-source version does not.

== Installation ==

1. Upload the plugin zip via Plugins > Add New > Upload Plugin, or extract it into `/wp-content/plugins/`.
2. Activate the plugin.
3. Add `[altus_colour_palette_generator]` to any page and publish it.

== Frequently Asked Questions ==

= Is it really free? =

Yes. Every palette, every export and every download is free, with no account needed.

= How many colours should my brand have? =

Six is plenty for a small business website: one primary, one or two supporting colours, one accent, plus dark, light and neutral tones for text and backgrounds. More than that and the site starts looking random.

= What does the contrast badge mean? =

It shows the contrast ratio between the swatch and text on top of it, following the WCAG accessibility standard. "AA" means body text is comfortably readable for most people. "Large text" means it is fine for big headings. "Decorative only" means don't put readable text on that colour — use it for backgrounds and shapes instead.

= Can I use this palette in print too? =

Yes — the hex codes convert cleanly to print colours in any design software. Just note that screens and printers render colour slightly differently, so proof anything critical before a big print run.

= What is a hex code? =

A hex code like `#2e6bff` is the standard way websites describe an exact colour. Six characters after the `#` define the red, green and blue mix. Give the hex codes to any designer, or paste the CSS variables into your site, and the colours will match exactly.

= How do I actually use the six colours on my website? =

Follow the 60-30-10 rule in the built-in guide: about 60% of the page stays light backgrounds, 30% carries your brand colours (headers, buttons, links), and 10% is the accent — prices, "Book now", limited offers. Because the accent is rare, it gets noticed.

= Does anything I enter leave my computer? =

No. All palette generation runs in your browser. In this open-source version there is no email option at all — nothing you enter is sent anywhere, stored anywhere, or seen by anyone.

== Changelog ==

= 1.0.0 =

First public release (stripped open-source version). 6-colour brand palettes from any base colour: 5 colour schemes x 4 brand styles, hex codes with click-to-copy, WCAG contrast badges (AA / large text / decorative), usage notes per colour, ready-to-paste CSS variables with Copy + Download palette.css, plain-text report download, 60-30-10 usage guide, and a "Surprise me" random palette. Email delivery, lead storage and email sending removed. The colour logic passed a 474-test Node harness.
