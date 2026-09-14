/**
 * icons.js — Global SVG icon helper for all Laku pages
 *
 * Replaces emoji icons with downloaded SVG files.
 * Usage: window.LakuIcons.svg("package", "1.25em") → <img> tag
 *
 * Load BEFORE other app scripts.
 */
(function () {
    "use strict";

    var BASE = "./assets/icons/";

    var ICONS = {
        /* Scenario / module icons */
        package:      "mdi--package-variant-closed.svg",
        wallet:       "arcticons--edenred-wallet.svg",
        chart:        "boxicons--chart-bar-big-columns-filled.svg",
        creditCard:   "iconmind--credit-card-outline-bold.svg",
        rocket:       "arcticons--rocket.svg",
        trendingUp:   "boxicons--trending-up-filled.svg",

        /* Badge icons */
        calculator:   "uil--calculator.svg",
        handshake:    "boxicons--handshake-filled.svg",
        crown:        "akar-icons--crown.svg",

        /* UI icons */
        check:        "akar-icons--check.svg",
        checkCircle:  "bi--check-circle.svg",
        closeCircle:  "ant-design--close-circle-filled.svg",
        lock:         "ant-design--lock-outlined.svg",
        play:         "akar-icons--play.svg",
        arrowRight:   "ci--arrow-right-md.svg",
        arrowUp:      "at-icons--arrow-up.svg",
        flag:         "ant-design--flag-outlined.svg",
        tag:          "akar-icons--tag.svg",
        book:         "akar-icons--book.svg",
        sparkle:      "boxicons--sparkle.svg",
        partyPopper:  "dinkie-icons--party-popper.svg",
        washingMachine: "griddy-icons--washing-machine.svg",
        statUp:       "akar-icons--statistic-up.svg",
        happy:        "mdi--emoticon-happy.svg",
        bug:          "akar-icons--bug.svg",

        /* HPP / App module icons */
        target:       "calculate.svg",
        memo:         "tabler--notes.svg",
        shoppingBag:  "bag-belanja.svg",
        lightbulb:    "think.svg",
        worker:       "industri.svg",
        lightning:    "internet.svg",
        save:         "notes.svg",
        document:     "buku-kebuka-icon.svg",
        pencil:       "pencil.svg",
        alarm:        "mynaui--alarm-clock.svg",

        /* Shared with learnIcons.js — same BASE path */
    };

    /**
     * Returns an <img> tag for the given icon name.
     * @param {string} name  - Key from ICONS map
     * @param {string} [size="1em"] - CSS width/height
     * @param {string} [extraClass=""] - Additional CSS classes
     * @returns {string} HTML string
     */
    function svg(name, size, extraClass) {
        var file = ICONS[name];
        if (!file) return "";
        size = size || "1em";
        var cls = "inline-block align-middle select-none" + (extraClass ? " " + extraClass : "");
        return '<img src="' + BASE + file + '" alt="' + name + '" class="' + cls + '" style="width:' + size + ';height:' + size + '">';
    }

    window.LakuIcons = {
        svg: svg,
        ICONS: ICONS,
        BASE: BASE
    };

    /* Backward compat: learnIcons delegates to global */
    window.LakuLearnIcons = window.LakuIcons;
})();
