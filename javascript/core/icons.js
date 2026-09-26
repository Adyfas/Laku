/**
 * icons.js — Global inline SVG icon helper for all Laku pages
 *
 * Returns inline <svg> markup (not <img>) so CSS can control color
 * via currentColor + Tailwind text-* classes.
 *
 * Usage: window.LakuIcons.svg("package", "1.25em") → <svg>…</svg>
 *
 * HTML auto-init: <span data-laku-icon="sparkle" data-laku-icon-size="1.25em"></span>
 *
 * Load BEFORE other app scripts.
 */
(function () {
    "use strict";

    /* ── Icon data: vb = viewBox, b = inner SVG body (bounding-box path stripped) ── */
    var ICONS = {
        /* Scenario / module icons */
        package: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.99.99 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88zM12 4.15l-1.89 1.07L16 8.61l1.96-1.11zM6.04 7.5L12 10.85l1.96-1.1l-5.88-3.4zM5 15.91l6 3.38v-6.71L5 9.21zm14 0v-6.7l-6 3.37v6.71z"/>'
        },
        wallet: {
            vb: "0 0 48 48",
            b: '<rect width="35.557" height="28.446" x="6.221" y="14.054" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" rx="4.399" ry="4.399"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M6.221 18.453v-2.556a3.935 3.935 0 0 1 2.823-3.775l21.992-6.485A3.3 3.3 0 0 1 35.268 8.8v5.253"/><circle cx="35.268" cy="28.277" r="2.749" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>'
        },
        chart: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M4 2H2v19c0 .55.45 1 1 1h19v-2H4z"/><rect width="6" height="14" x="14" y="4" fill="currentColor" rx="1" ry="1"/><rect width="6" height="9" x="6" y="9" fill="currentColor" rx="1" ry="1"/>'
        },
        creditCard: {
            vb: "0 0 24 24",
            b: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"><path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/><path d="M2 11h20"/><path d="M5 15h5"/></g>'
        },
        rocket: {
            vb: "0 0 48 48",
            b: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5.896 22.443L42.105 5.5l-10.836 37l-11.453-13.323z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m31.326 16.95l-11.51 12.227v8.747l3.316-4.824"/>'
        },
        trendingUp: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M18.29 9.29L15 12.58l-4.29-4.29a.996.996 0 0 0-1.41 0l-7 7l1.41 1.41L10 10.41l4.29 4.29c.39.39 1.02.39 1.41 0l4-4l2.29 2.29v-6h-6l2.29 2.29Z"/>'
        },

        /* Badge icons */
        calculator: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M12.71 17.29a1 1 0 0 0-.16-.12a.6.6 0 0 0-.17-.09a.6.6 0 0 0-.19-.06a.93.93 0 0 0-.57.06a.9.9 0 0 0-.54.54a.84.84 0 0 0-.08.38a1 1 0 0 0 .07.38a1.5 1.5 0 0 0 .22.33A1 1 0 0 0 12 19a.84.84 0 0 0 .38-.08a1.2 1.2 0 0 0 .33-.21A1 1 0 0 0 13 18a1 1 0 0 0-.08-.38a1 1 0 0 0-.21-.33m-4.16-4.12a.6.6 0 0 0-.17-.09a.6.6 0 0 0-.19-.08a.86.86 0 0 0-.39 0l-.18.06l-.18.09l-.15.12A1.05 1.05 0 0 0 7 14a1 1 0 0 0 .29.71a1.2 1.2 0 0 0 .33.21A1 1 0 0 0 9 14a1.05 1.05 0 0 0-.29-.71Zm.16 4.12a1 1 0 0 0-.33-.21A1 1 0 0 0 7.8 17l-.18.06a.8.8 0 0 0-.18.09a2 2 0 0 0-.15.12a1 1 0 0 0-.21.33a.94.94 0 0 0 0 .76a1.2 1.2 0 0 0 .21.33A1 1 0 0 0 8 19a.84.84 0 0 0 .38-.08a1.2 1.2 0 0 0 .33-.21a1.2 1.2 0 0 0 .21-.33a.94.94 0 0 0 0-.76a1 1 0 0 0-.21-.33m2.91-4.21a1 1 0 0 0-.33.21A1.05 1.05 0 0 0 11 14a1 1 0 0 0 1.38.92a1.2 1.2 0 0 0 .33-.21A1 1 0 0 0 13 14a1.05 1.05 0 0 0-.29-.71a1 1 0 0 0-1.09-.21m5.09 4.21a1.2 1.2 0 0 0-.33-.21a1 1 0 0 0-1.09.21a1 1 0 0 0-.21.33a.94.94 0 0 0 0 .76a1.2 1.2 0 0 0 .21.33A1 1 0 0 0 16 19a.84.84 0 0 0 .38-.08a1.2 1.2 0 0 0 .33-.21a1 1 0 0 0 .21-1.09a1 1 0 0 0-.21-.33M16 5H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1m-1 4H9V7h6Zm3-8H6a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3m1 19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1Zm-2.45-6.83a.6.6 0 0 0-.17-.09a.6.6 0 0 0-.19-.06a.86.86 0 0 0-.39 0l-.18.06l-.18.09l-.15.12A1.05 1.05 0 0 0 15 14a1 1 0 0 0 1.38.92a1.2 1.2 0 0 0 .33-.21A1 1 0 0 0 17 14a1.05 1.05 0 0 0-.29-.71Z"/>'
        },
        handshake: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M8.76 7.95c-.19.19-.19.51 0 .71l.1.1c.76.76 2.07.76 2.83 0l3.04-3.04l.71.71l-.9.9l5.78 5.78c2.29-2.36 2.27-6.01-.07-8.35c-2.16-2.15-5.42-2.31-7.77-.54L8.77 7.96Z"/><path fill="currentColor" d="m9.59 15.81l.71-.71l4 4l1.19-1.19l-4.01-4.01l.71-.71l4.01 4.01l1.19-1.19L13.38 12l.71-.71l4.01 4.01l1.51-1.5l-5.79-5.78l-1.43 1.43c-.57.57-1.32.88-2.12.88s-1.55-.31-2.12-.88l-.1-.1c-.58-.58-.58-1.53 0-2.12l3.21-3.24c-2.33-1.55-5.42-1.31-7.5.75c-2.36 2.37-2.36 6.07 0 8.43l7.53 7.52c.19.19.45.29.71.29s.51-.1.71-.29l.89-.89l-4-4Z"/>'
        },
        crown: {
            vb: "0 0 24 24",
            b: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m2 8l1.304 1.043a4 4 0 0 0 5.995-1.181L12 3l2.701 4.862a4 4 0 0 0 5.996 1.18L22 8l-1.754 8.77a2.56 2.56 0 0 1-1.367 1.79v0a15.38 15.38 0 0 1-13.758 0v0a2.56 2.56 0 0 1-1.367-1.79z"/><path d="M8 15c2.596 1.333 5.404 1.333 8 0"/></g>'
        },

        /* UI icons */
        check: {
            vb: "0 0 24 24",
            b: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12l6 6L20 6"/>'
        },
        checkCircle: {
            vb: "0 0 16 16",
            b: '<g fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m10.97 4.97l-.02.022l-3.473 4.425l-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/></g>'
        },
        closeCircle: {
            vb: "0 0 1024 1024",
            b: '<path fill="currentColor" fill-rule="evenodd" d="M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960S64 759.4 64 512S264.6 64 512 64m127.978 274.82l-.034.006c-.023.007-.042.018-.083.059L512 466.745l-127.86-127.86c-.042-.041-.06-.052-.084-.059a.12.12 0 0 0-.07 0c-.022.007-.041.018-.082.059l-45.02 45.019c-.04.04-.05.06-.058.083a.12.12 0 0 0 0 .07l.01.022a.3.3 0 0 0 .049.06L466.745 512l-127.86 127.862c-.041.04-.052.06-.059.083a.12.12 0 0 0 0 .07c.007.022.018.041.059.082l45.019 45.02c.04.04.06.05.083.058a.12.12 0 0 0 .07 0c.022-.007.041-.018.082-.059L512 557.254l127.862 127.861c.04.041.052.06.083.059a.12.12 0 0 0 .07 0c.022-.007.041-.018.082-.059l45.02-45.019c.04-.04.05-.06.058-.083a.12.12 0 0 0 0-.07l-.01-.022a.3.3 0 0 0-.049-.06L557.254 512l127.861-127.86c.041-.042.052-.06.059-.084a.12.12 0 0 0 0-.07c-.007-.022-.018-.041-.059-.082l-45.019-45.02a.2.2 0 0 0-.083-.058a.12.12 0 0 0-.07 0Z"/>'
        },
        lock: {
            vb: "0 0 1024 1024",
            b: '<path fill="currentColor" d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32M332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332zm460 600H232V536h560zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 1 0-56 0"/>'
        },
        play: {
            vb: "0 0 24 24",
            b: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4v16m14-8L6 20m14-8L6 4"/>'
        },
        arrowRight: {
            vb: "0 0 24 24",
            b: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m0 0l-6-6m6 6l-6 6"/>'
        },
        arrowUp: {
            vb: "0 0 16 16",
            b: '<path fill="currentColor" d="M8 1a1 1 0 0 1 .707.293l6 6a1 1 0 1 1-1.414 1.414L9 4.414V14a1 1 0 0 1-2 0V4.414L2.707 8.707a1 1 0 1 1-1.414-1.414l6-6l.073-.066A1 1 0 0 1 8 1"/>'
        },
        arrowBold: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M13 7.828V20h-2V7.828l-5.364 5.364l-1.414-1.414L12 4l7.778 7.778l-1.414 1.414z"/>'
        },
        flag: {
            vb: "0 0 1024 1024",
            b: '<path fill="currentColor" d="M880 305H624V192c0-17.7-14.3-32-32-32H184v-40c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v784c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V640h248v113c0 17.7 14.3 32 32 32h416c17.7 0 32-14.3 32-32V337c0-17.7-14.3-32-32-32M184 568V232h368v336zm656 145H504v-73h112c4.4 0 8-3.6 8-8V377h216z"/>'
        },
        tag: {
            vb: "0 0 24 24",
            b: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-linejoin="round" d="M15.244 21.366a2.164 2.164 0 0 1-3.061 0l-8.549-8.549A2.16 2.16 0 0 1 3 11.287V5.164C3 3.97 3.97 3 5.164 3h6.123c.573 0 1.124.228 1.53.634l8.549 8.549a2.164 2.164 0 0 1 0 3.061z"/><path d="M6.5 6.5L7 7"/></g>'
        },
        book: {
            vb: "0 0 24 24",
            b: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 6s1.5-2 5-2s5 2 5 2v14s-1.5-1-5-1s-5 1-5 1zm10 0s1.5-2 5-2s5 2 5 2v14s-1.5-1-5-1s-5 1-5 1z"/>'
        },
        sparkle: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="m21.45 11.11l-3-1.5l-2.7-1.35l-1.35-2.7l-1.5-3c-.34-.68-1.45-.68-1.79 0l-1.5 3l-1.35 2.7l-2.7 1.35l-3 1.5c-.34.17-.55.52-.55.89s.21.72.55.89l3 1.5l2.7 1.35l1.35 2.7l1.5 3c.17.34.52.55.89.55s.73-.21.89-.55l1.5-3l1.35-2.7l2.7-1.35l3-1.5c.34-.17.55-.52.55-.89s-.21-.72-.55-.89Zm-3.89 1.5l-.84.42l-2.16 1.08l-.3.15l-.15.3L12 18.77l-2.11-4.21l-.15-.3l-.3-.15l-2.16-1.08l-.84-.42L5.23 12l1.21-.61l.84-.42l2.16-1.08l.3-.15l.15-.3L12 5.23l2.11 4.21l.15.3l.3.15l2.16 1.08l.84.42l1.21.61z"/>'
        },
        partyPopper: {
            vb: "0 0 12 12",
            b: '<path fill="currentColor" d="M5 10H4V9H3V8H2V7H1v2h1v1h1v1h2Zm0 0h2V9h2V8H7V7H6V6H5V5H4V3H3v2H2v2h1v1h1v1h1Zm-5 2h3v-1H2v-1H1V9H0Zm0-9h1V2H0Zm10 8h1v-1h-1ZM2 2h3V1H2Zm5 4h1V5H7ZM5 4h1V2H5Zm5 5h1V7h-1ZM9 7h1V6H9ZM8 5h3V4H8ZM7 3h1V1H7Zm3 0h1V2h-1Zm0 0"/>'
        },
        washingMachine: {
            vb: "0 0 24 24",
            b: '<g fill="currentColor"><path d="M19.75 3H4.25C3.56 3 3 3.56 3 4.25v15.5c0 .69.56 1.25 1.25 1.25h15.5c.69 0 1.25-.56 1.25-1.25V4.25C21 3.56 20.44 3 19.75 3m-.25 16.5h-15v-15h15z"/><path d="M12 18.5c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6m0-1.5a4.5 4.5 0 0 1-4.395-3.545l.425-.425c.46-.46 1.07-.71 1.72-.71s1.26.255 1.72.71a3.9 3.9 0 0 0 2.78 1.15c.765 0 1.49-.22 2.12-.62A4.51 4.51 0 0 1 12 17m0-9a4.5 4.5 0 0 1 4.395 3.545l-.425.425c-.46.46-1.07.71-1.72.71s-1.26-.255-1.72-.71a3.9 3.9 0 0 0-2.78-1.15c-1.49 0-2.12.62-2.12.62A4.51 4.51 0 0 1 12 8m5.5-.5a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/></g>'
        },
        statUp: {
            vb: "0 0 24 24",
            b: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-miterlimit="5.759" d="M3 3v16a2 2 0 0 0 2 2h16"/><path stroke-miterlimit="5.759" d="m7 14l4-4l4 4l6-6"/><path d="M18 8h3v3"/></g>'
        },
        happy: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2M7 9.5C7 8.7 7.7 8 8.5 8s1.5.7 1.5 1.5S9.3 11 8.5 11S7 10.3 7 9.5m5 7.73c-1.75 0-3.29-.73-4.19-1.81L9.23 14c.45.72 1.52 1.23 2.77 1.23s2.32-.51 2.77-1.23l1.42 1.42c-.9 1.08-2.44 1.81-4.19 1.81M15.5 11c-.8 0-1.5-.7-1.5-1.5S14.7 8 15.5 8s1.5.7 1.5 1.5s-.7 1.5-1.5 1.5"/>'
        },
        bug: {
            vb: "0 0 24 24",
            b: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5a7 7 0 0 1-7 7v0a7 7 0 0 1-7-7zm3-3v-.425c0-.981.384-1.96 1.326-2.238c1.525-.45 3.823-.45 5.348 0C15.616 3.615 16 4.594 16 5.575V6m2.5 1.5L22 4M5.5 7.5L2 4m4 14l-4 3m3-9H1.5m21 0H19m-1 6l4 3m-10-8v8"/>'
        },

        /* HPP / App module icons */
        target: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M8.308 15.692v1.558q0 .19.126.316t.316.126t.316-.126t.126-.316v-1.558h1.558q.19 0 .316-.126q.126-.125.126-.316t-.126-.316t-.316-.126H9.192V13.25q0-.19-.126-.316t-.316-.126t-.316.126t-.126.316v1.558H6.75q-.19 0-.316.126q-.126.125-.126.316t.126.316q.125.126.316.126zm5.442 1.25h3.5q.19 0 .316-.126q.126-.125.126-.316t-.126-.316q-.125-.126-.316-.126h-3.5q-.19 0-.316.126t-.126.316t.126.316t.316.126m0-2.5h3.5q.19 0 .316-.126q.126-.125.126-.316t-.126-.316q-.125-.126-.316-.126h-3.5q-.19 0-.316.126t-.126.316t.126.316t.316.126M7 8.892h3.5q.19 0 .316-.126q.126-.125.126-.316t-.126-.316t-.316-.126H7q-.19 0-.316.126t-.126.316t.126.316t.316.126M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h12.769q.69 0 1.153.463T20 5.616v12.769q0 .69-.462 1.153T18.384 20zm0-1h12.769q.23 0 .423-.192t.192-.424V5.616q0-.231-.192-.424T18.384 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192M5 5v14zm10.5 4.089l1.087 1.086q.129.129.304.139q.175.009.323-.139q.142-.142.145-.31q.002-.169-.14-.317L16.127 8.45l1.087-1.086q.128-.13.138-.304q.01-.175-.138-.323t-.314-.148t-.313.148L15.5 7.823l-1.086-1.086q-.13-.13-.305-.139t-.323.139t-.147.313t.148.314l1.086 1.086l-1.092 1.098q-.123.129-.133.304t.139.323t.313.148t.314-.148z"/>'
        },
        memo: {
            vb: "0 0 24 24",
            b: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zm4 2h6m-6 4h6m-6 4h4"/>'
        },
        shoppingBag: {
            vb: "0 0 256 256",
            b: '<path fill="currentColor" d="M216 66h-42v-2a46 46 0 0 0-92 0v2H40a14 14 0 0 0-14 14v120a14 14 0 0 0 14 14h176a14 14 0 0 0 14-14V80a14 14 0 0 0-14-14M94 64a34 34 0 0 1 68 0v2H94Zm124 136a2 2 0 0 1-2 2H40a2 2 0 0 1-2-2V80a2 2 0 0 1 2-2h42v18a6 6 0 0 0 12 0V78h68v18a6 6 0 0 0 12 0V78h42a2 2 0 0 1 2 2Z"/>'
        },
        lightbulb: {
            vb: "0 0 32 32",
            b: '<path fill="currentColor" d="M2.29 31.235h1.52v-1.52h1.52v-1.52H3.81v-1.53H2.29v1.53H.76v1.52h1.53zm3.04-21.33h1.53v6.1H5.33Zm3.05 16.76v-1.52H9.9v-3.05H8.38v-1.52H5.33v1.52H3.81v3.05h1.52v1.52zm-1.52-10.66h1.52v1.52H6.86Zm0-9.15h1.52v3.05H6.86Zm1.52 10.67H9.9v1.52H8.38Zm0-13.72H9.9v3.05H8.38Zm1.52 15.24h3.05v1.53H9.9Zm1.53-7.62h1.52v1.53h-1.52ZM9.9 2.285h3.05v1.52H9.9Zm3.05-1.52h10.67v1.52H12.95Zm4.57 10.66h1.53v1.53h-1.53Zm-4.57 9.15h10.67v1.52H12.95Zm10.67-1.53h3.05v1.53h-3.05Zm0-7.62h1.52v1.53h-1.52Zm0-9.14h3.05v1.52h-3.05Zm3.05 15.24h1.52v1.52h-1.52Zm0-13.72h1.52v1.53h-1.52Zm1.52 10.67h1.52v3.05h-1.52Zm0-9.14h1.52v3.05h-1.52Zm1.52 3.05h1.53v6.09h-1.53Z"/>'
        },
        worker: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M4 18v2h4v-2zm0-4v2h10v-2zm6 4v2h4v-2zm6-4v2h4v-2zm0 4v2h4v-2zM2 22V8l5 4V8l5 4V8l5 4l1-10h3l1 10v10z"/>'
        },
        lightning: {
            vb: "0 0 20 20",
            b: '<g fill="currentColor"><path d="M11.5 20a8.5 8.5 0 1 1 0-17a8.5 8.5 0 0 1 0 17" opacity=".2"/><path fill-rule="evenodd" d="M1.5 10a8.5 8.5 0 1 0 17 0a8.5 8.5 0 0 0-17 0m16 0a7.5 7.5 0 1 1-15 0a7.5 7.5 0 0 1 15 0" clip-rule="evenodd"/><path fill-rule="evenodd" d="M6.5 10c0 4.396 1.442 8 3.5 8s3.5-3.604 3.5-8s-1.442-8-3.5-8s-3.5 3.604-3.5 8m6 0c0 3.889-1.245 7-2.5 7s-2.5-3.111-2.5-7S8.745 3 10 3s2.5 3.111 2.5 7" clip-rule="evenodd"/><path d="m3.735 5.312l.67-.742q.16.144.343.281c1.318.988 3.398 1.59 5.665 1.59c1.933 0 3.737-.437 5.055-1.19a5.6 5.6 0 0 0 .857-.597l.65.76q-.448.383-1.01.704c-1.477.845-3.452 1.323-5.552 1.323c-2.47 0-4.762-.663-6.265-1.79a6 6 0 0 1-.413-.34m0 9.389l.67.74q.16-.145.343-.28c1.318-.988 3.398-1.59 5.665-1.59c1.933 0 3.737.436 5.055 1.19q.482.277.857.596l.65-.76a6.6 6.6 0 0 0-1.01-.704c-1.477-.844-3.452-1.322-5.552-1.322c-2.47 0-4.762.663-6.265 1.789q-.22.165-.413.34M2 10.5v-1h16v1z"/></g>'
        },
        save: {
            vb: "0 0 24 24",
            b: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M16.5 4H8a4 4 0 0 0-4 4v8.5a4 4 0 0 0 4 4h6.843a4 4 0 0 0 2.829-1.172l1.656-1.656a4 4 0 0 0 1.172-2.829V8a4 4 0 0 0-4-4"/><path d="M20.5 14H17a3 3 0 0 0-3 3v3.5M8 8h7.5M8 12h5"/></g>'
        },
        document: {
            vb: "0 0 24 24",
            b: '<g fill="none"><path fill="currentColor" fill-opacity=".16" d="M12 7.333C12 5.5 10.5 4 8.667 4H2v12h6.708C12 16 12 19.334 12 19.334S12 16 15.333 16H22V4h-6.667A3.343 3.343 0 0 0 12 7.333"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M12 7.333C12 5.5 10.5 4 8.667 4H2v12h6.708C12 16 12 19.334 12 19.334m0-12C12 5.5 13.5 4 15.333 4H22v12h-6.667C12 16 12 19.334 12 19.334m0-12v12m1.875 1.124A2.58 2.58 0 0 1 16.167 19H21m-10.875 1.458A2.54 2.54 0 0 0 7.833 19H3"/></g>'
        },
        pencil: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"/>'
        },
        alarm: {
            vb: "0 0 24 24",
            b: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M3 5.231L6.15 3M21 5.231L17.85 3M20 13a8 8 0 1 1-16 0a8 8 0 0 1 16 0"/><path d="M12 8.5v5l3 2"/></g>'
        },
        warung: {
            vb: "0 0 24 24",
            b: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.996 10.621V19a2 2 0 0 1-2 2H6.004a2 2 0 0 1-1.999-2v-8.379M16.498 8.75c0 3.176 5.155 2.52 4.433-.248l-1.045-4.007A2 2 0 0 0 17.952 3H6.048a2 2 0 0 0-1.934 1.495L3.069 8.502c-.722 2.769 4.433 3.424 4.433.248l.5-5.75m-.5 5.75c0 2.902 4.498 2.902 4.498 0m0 0V3m3.998 0l.5 5.75c0 2.902-4.498 2.902-4.498 0"/>'
        },
        ai: {
            vb: "0 0 24 24",
            b: '<path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M15 19c1.2-3.678 2.526-5.005 6-6c-3.474-.995-4.8-2.322-6-6c-1.2 3.678-2.526 5.005-6 6c3.474.995 4.8 2.322 6 6Zm-8-9c.6-1.84 1.263-2.503 3-3c-1.737-.497-2.4-1.16-3-3c-.6 1.84-1.263 2.503-3 3c1.737.497 2.4 1.16 3 3Zm1.5 10c.3-.92.631-1.251 1.5-1.5c-.869-.249-1.2-.58-1.5-1.5c-.3.92-.631 1.251-1.5 1.5c.869.249 1.2.58 1.5 1.5Z"/>'
        },
        landingCalc: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M8.308 15.692v1.558q0 .19.126.316t.316.126t.316-.126t.126-.316v-1.558h1.558q.19 0 .316-.126q.126-.125.126-.316t-.126-.316t-.316-.126H9.192V13.25q0-.19-.126-.316t-.316-.126t-.316.126t-.126.316v1.558H6.75q-.19 0-.316.126q-.126.125-.126.316t.126.316q.125.126.316.126zm5.442 1.25h3.5q.19 0 .316-.126q.126-.125.126-.316t-.126-.316q-.125-.126-.316-.126h-3.5q-.19 0-.316.126t-.126.316t.126.316t.316.126m0-2.5h3.5q.19 0 .316-.126q.126-.125.126-.316t-.126-.316q-.125-.126-.316-.126h-3.5q-.19 0-.316.126t-.126.316t.126.316t.316.126M7 8.892h3.5q.19 0 .316-.126q.126-.125.126-.316t-.126-.316t-.316-.126H7q-.19 0-.316.126t-.126.316t.126.316t.316.126M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h12.769q.69 0 1.153.463T20 5.616v12.769q0 .69-.462 1.153T18.384 20zm0-1h12.769q.23 0 .423-.192t.192-.424V5.616q0-.231-.192-.424T18.384 5H5.616q-.231 0-.424.192T5 5.616v12.769q0 .23.192.423t.423.192M5 5v14zm10.5 4.089l1.087 1.086q.129.129.304.139q.175.009.323-.139q.142-.142.145-.31q.002-.169-.14-.317L16.127 8.45l1.087-1.086q.128-.13.138-.304q.01-.175-.138-.323t-.314-.148t-.313.148L15.5 7.823l-1.086-1.086q-.13-.13-.305-.139t-.323.139t-.147.313t.148.314l1.086 1.086l-1.092 1.098q-.123.129-.133.304t.139.323t.313.148t.314-.148z"/>'
        },
        landingNotes: {
            vb: "0 0 24 24",
            b: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M16.5 4H8a4 4 0 0 0-4 4v8.5a4 4 0 0 0 4 4h6.843a4 4 0 0 0 2.829-1.172l1.656-1.656a4 4 0 0 0 1.172-2.829V8a4 4 0 0 0-4-4"/><path d="M20.5 14H17a3 3 0 0 0-3 3v3.5M8 8h7.5M8 12h5"/></g>'
        },
        landingGlobe: {
            vb: "0 0 20 20",
            b: '<g fill="currentColor"><path d="M11.5 20a8.5 8.5 0 1 1 0-17a8.5 8.5 0 0 1 0 17" opacity=".2"/><path fill-rule="evenodd" d="M1.5 10a8.5 8.5 0 1 0 17 0a8.5 8.5 0 0 0-17 0m16 0a7.5 7.5 0 1 1-15 0a7.5 7.5 0 0 1 15 0" clip-rule="evenodd"/><path fill-rule="evenodd" d="M6.5 10c0 4.396 1.442 8 3.5 8s3.5-3.604 3.5-8s-1.442-8-3.5-8s-3.5 3.604-3.5 8m6 0c0 3.889-1.245 7-2.5 7s-2.5-3.111-2.5-7S8.745 3 10 3s2.5 3.111 2.5 7" clip-rule="evenodd"/><path d="m3.735 5.312l.67-.742q.16.144.343.281c1.318.988 3.398 1.59 5.665 1.59c1.933 0 3.737-.437 5.055-1.19a5.6 5.6 0 0 0 .857-.597l.65.76q-.448.383-1.01.704c-1.477.845-3.452 1.323-5.552 1.323c-2.47 0-4.762-.663-6.265-1.79a6 6 0 0 1-.413-.34m0 9.389l.67.74q.16-.145.343-.28c1.318-.988 3.398-1.59 5.665-1.59c1.933 0 3.737.436 5.055 1.19q.482.277.857.596l.65-.76a6.6 6.6 0 0 0-1.01-.704c-1.477-.844-3.452-1.322-5.552-1.322c-2.47 0-4.762.663-6.265 1.789q-.22.165-.413.34M2 10.5v-1h16v1z"/></g>'
        },
        landingFactory: {
            vb: "0 0 24 24",
            b: '<path fill="currentColor" d="M4 18v2h4v-2zm0-4v2h10v-2zm6 4v2h4v-2zm6-4v2h4v-2zm0 4v2h4v-2zM2 22V8l5 4V8l5 4V8l5 4l1-10h3l1 10v10z"/>'
        },
        landingBrain: {
            vb: "0 0 32 32",
            b: '<path fill="currentColor" d="M2.29 31.235h1.52v-1.52h1.52v-1.52H3.81v-1.53H2.29v1.53H.76v1.52h1.53zm3.04-21.33h1.53v6.1H5.33Zm3.05 16.76v-1.52H9.9v-3.05H8.38v-1.52H5.33v1.52H3.81v3.05h1.52v1.52zm-1.52-10.66h1.52v1.52H6.86Zm0-9.15h1.52v3.05H6.86Zm1.52 10.67H9.9v1.52H8.38Zm0-13.72H9.9v3.05H8.38Zm1.52 15.24h3.05v1.53H9.9Zm1.53-7.62h1.52v1.53h-1.52ZM9.9 2.285h3.05v1.52H9.9Zm3.05-1.52h10.67v1.52H12.95Zm4.57 10.66h1.53v1.53h-1.53Zm-4.57 9.15h10.67v1.52H12.95Zm10.67-1.53h3.05v1.53h-3.05Zm0-7.62h1.52v1.53h-1.52Zm0-9.14h3.05v1.52h-3.05Zm3.05 15.24h1.52v1.52h-1.52Zm0-13.72h1.52v1.53h-1.52Zm1.52 10.67h1.52v3.05h-1.52Zm0-9.14h1.52v3.05h-1.52Zm1.52 3.05h1.53v6.09h-1.53Z"/>'
        },
        landingOpenBook: {
            vb: "0 0 24 24",
            b: '<g fill="none"><path fill="currentColor" fill-opacity=".16" d="M12 7.333C12 5.5 10.5 4 8.667 4H2v12h6.708C12 16 12 19.334 12 19.334S12 16 15.333 16H22V4h-6.667A3.343 3.343 0 0 0 12 7.333"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M12 7.333C12 5.5 10.5 4 8.667 4H2v12h6.708C12 16 12 19.334 12 19.334m0-12C12 5.5 13.5 4 15.333 4H22v12h-6.667C12 16 12 19.334 12 19.334m0-12v12m1.875 1.124A2.58 2.58 0 0 1 16.167 19H21m-10.875 1.458A2.54 2.54 0 0 0 7.833 19H3"/></g>'
        },
        // UI landing page
        box: {
            vb: "0 0 24 24",
            b: '<path d="M0 0h24v24H0z" fill="none"/><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"><path stroke-linecap="round" d="M11.029 2.54a2 2 0 0 1 1.942 0l7.515 4.174a1 1 0 0 1 .514.874v8.235a2 2 0 0 1-1.029 1.749l-7 3.888a2 2 0 0 1-1.942 0l-7-3.889A2 2 0 0 1 3 15.824V7.588a1 1 0 0 1 .514-.874z"/><path d="m3 7l9 5m0 0l9-5m-9 5v9.5"/><path stroke-linecap="round" d="m7.5 9.5l9-5M6 12.328L9 14"/></g>'
        },
        walletv2: {
            vb: "0 0 24 24",
            b: '<path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M16 12h2v4h-2z" /><path fill="currentColor" d="M21 7h-1V4c0-.55-.45-1-1-1H5C3.35 3 2 4.35 2 6v12c0 2.2 1.79 3 3 3h16c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1M5 5h13v2H5c-.55 0-1-.45-1-1s.45-1 1-1m15 14H5.01C4.55 18.99 4 18.81 4 18V8.82c.31.11.65.18 1 .18h15z" />'
        },
    };


    /**
     * Returns inline <svg> markup for the given icon name.
     * Color is controlled by CSS `color` property (currentColor).
     *
     * @param {string} name  - Key from ICONS map
     * @param {string} [size="1em"] - CSS width/height
     * @param {string} [extraClass=""] - Additional CSS classes (e.g. Tailwind)
     * @returns {string} HTML string of inline <svg>
     */
    function svg(name, size, extraClass) {
        var icon = ICONS[name];
        if (!icon) return "";
        size = size || "1em";
        var cls = "inline-block align-middle select-none" + (extraClass ? " " + extraClass : "");
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + icon.vb +
            '" style="width:' + size + ';height:' + size +
            '" class="' + cls + '" aria-hidden="true">' + icon.b + '</svg>';
    }

    /**
     * Auto-replace [data-laku-icon] elements with inline SVG.
     * Attributes: data-laku-icon="name", data-laku-icon-size="1.25em"
     */
    function initIcons() {
        var els = document.querySelectorAll("[data-laku-icon]");
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var name = el.getAttribute("data-laku-icon");
            var size = el.getAttribute("data-laku-icon-size") || "1em";
            el.innerHTML = svg(name, size);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initIcons);
    } else {
        initIcons();
    }

    window.LakuIcons = {
        svg: svg,
        ICONS: ICONS,
        initIcons: initIcons
    };

    /* Backward compat: learnIcons delegates to global */
    window.LakuLearnIcons = window.LakuIcons;
})();
