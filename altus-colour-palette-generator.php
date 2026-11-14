<?php
/**
 * Plugin Name: Altus Colour Palette Generator
 * Description: Free colour palette generator. Pick a base colour and get a full 6-colour brand palette with hex codes, contrast checks and exportable CSS — all computed in the visitor's browser. This open-source version contains NO lead capture, NO email sending, and NO data storage.
 * Version: 1.0.0
 * Author: Altus Web Solutions
 * Text Domain: altus-colour-palette-generator
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * No third-party libraries. Palette generation is 100% client-side JavaScript;
 * the server handles nothing — no email, no storage, no data leaves the browser.
 */

if (!defined('ABSPATH')) exit;

define('CPG_VERSION', '1.0.0');
define('CPG_PATH', plugin_dir_path(__FILE__));
define('CPG_URL', plugin_dir_url(__FILE__));


/* ------------------------------------------------------------------ */
/* Frontend assets (only loaded when the shortcode is present)        */
/* ------------------------------------------------------------------ */
add_action('wp_enqueue_scripts', 'cpg_enqueue');
function cpg_enqueue() {
    if (is_admin()) return;
    global $post;
    if (!($post instanceof WP_Post) || !has_shortcode($post->post_content, 'altus_colour_palette_generator')) return;

    wp_enqueue_style('cpg-gen', CPG_URL . 'assets/generator.css', array(), CPG_VERSION);
    wp_enqueue_script('cpg-logic', CPG_URL . 'assets/palette-logic.js', array(), CPG_VERSION, true);
    wp_enqueue_script('cpg-gen', CPG_URL . 'assets/generator.js', array('cpg-logic'), CPG_VERSION, true);
}

/* ------------------------------------------------------------------ */
/* Shortcode: renders the generator UI                                */
/* ------------------------------------------------------------------ */
add_shortcode('altus_colour_palette_generator', 'cpg_shortcode');
function cpg_shortcode() {
    ob_start();
    ?>
    <div id="cpg-root" class="cpg-root">
        <div class="cpg-card">
            <div class="cpg-badge">Free tool</div>
            <h2 class="cpg-title">Build your brand colour palette</h2>
            <p class="cpg-sub">Pick a base colour — your logo colour, your favourite, anything — and get a complete 6-colour brand palette in seconds: primary, secondary and accent plus dark, light and neutral tones, each with its hex code, a contrast check, and ready-to-paste CSS variables. Everything runs in your browser; nothing you enter leaves your device.</p>

            <div class="cpg-form">
                <div class="cpg-field">
                    <label class="cpg-label" for="cpg-base-color">Your base colour</label>
                    <div class="cpg-color-row">
                        <input id="cpg-base-color" class="cpg-swatch-input" type="color" value="#2e6bff">
                        <input id="cpg-base-hex" class="cpg-input cpg-hex-input" type="text" maxlength="7" value="#2e6bff" spellcheck="false" autocomplete="off">
                    </div>
                    <span class="cpg-hint">Pick from the box, or type a hex code like #2e6bff</span>
                </div>
                <div class="cpg-field">
                    <label class="cpg-label" for="cpg-scheme">Colour scheme</label>
                    <select id="cpg-scheme" class="cpg-select"></select>
                </div>
                <div class="cpg-field">
                    <label class="cpg-label" for="cpg-style">Brand style</label>
                    <select id="cpg-style" class="cpg-select"></select>
                </div>
                <div class="cpg-field">
                    <label class="cpg-label" for="cpg-biz">Business name <span class="cpg-opt">(optional — labels your CSS)</span></label>
                    <input id="cpg-biz" class="cpg-input" type="text" maxlength="60" placeholder="e.g. Acme Plumbing" autocomplete="off">
                </div>
            </div>

            <div class="cpg-btn-row">
                <button type="button" class="cpg-btn" id="cpg-generate">Generate my palette</button>
                <button type="button" class="cpg-btn-ghost" id="cpg-surprise">Surprise me</button>
            </div>
            <p class="cpg-error" id="cpg-error" role="alert" hidden></p>

            <div id="cpg-results" class="cpg-results" hidden></div>


            <p class="cpg-fineprint">Palettes are generated from your base colour using standard colour theory; the contrast badges follow WCAG ratios. Always check text legibility yourself on your real website before publishing — screens and print can differ.</p>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

