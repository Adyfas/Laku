
(function () {
    "use strict";


    var D = window.LakuLearnData;       // constants + data lookups
    var S = window.LakuLearnState;      // state persistence & gamification
    var DOM = window.LakuLearnDOM;      // DOM primitives (bubble, mood, escape)
    var SC = window.LakuLearnScenario;  // navigation & choice logic
    var I = window.LakuLearnInternal;   // shared runtime state
    var ICONS = window.LakuLearnIcons;  // SVG icon helper

  
    var UI = {
        // Cards
        card:        "rounded-3xl bg-white border border-gray-100 shadow-xl p-5 sm:p-6",
        successCard: "rounded-2xl border border-emerald-200 bg-emerald-50 p-4",
        successSm:   "flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 mb-4",
        warningCard: "rounded-2xl border border-amber-200 bg-amber-50 p-4",
        warningSm:   "flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 mb-4",
        brandCard:   "rounded-3xl bg-gradient-to-br from-[#274c43] to-[#0f4c5c] text-white p-5 sm:p-6 shadow-xl overflow-hidden",

        // Buttons
        btnPrimary:  "w-full bg-black-main text-white-main font-bold py-3.5 px-4 rounded-2xl hover:bg-gray-800 transition-colors",
        btnBrand:    "w-full bg-[#274c43] text-white-main font-bold py-3.5 px-4 rounded-2xl hover:bg-[#0f4c5c] transition-colors",
        btnBrandLg:  "w-full bg-[#274c43] text-white-main font-semibold py-4 px-6 rounded-2xl hover:bg-[#0f4c5c] transition-colors text-lg",
        btnBrandLink:"block w-full bg-[#274c43] text-white-main font-bold py-4 px-5 rounded-2xl hover:bg-[#0f4c5c] transition-colors text-center text-lg mb-2",
        btnOutline:  "w-full bg-white border border-gray-200 text-black-main font-bold py-3 px-4 rounded-2xl hover:border-[#274c43] transition-colors",
        btnSm:       "w-full bg-white border border-gray-200 text-black-main font-bold py-3 px-4 rounded-2xl hover:border-[#274c43] transition-colors",
        btnBack:     "w-full bg-white border border-gray-200 text-gray-600 font-semibold py-3 px-4 rounded-2xl hover:border-gray-300 hover:text-gray-800 transition-colors",

        // Section labels
        labelGray:   "text-xs font-bold uppercase tracking-widest text-gray-500 mb-2",
        labelGreen:  "text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2",
        labelAmber:  "text-xs font-bold uppercase tracking-widest text-amber-700 mb-2",

        // Choice option base class
        optionBase:  "w-full text-left p-4 rounded-2xl border-2 border-gray-200 transition-all"
    };

    /* ── Template Helpers ── */

    function esc(text) {
        return DOM.escapeHtml(text);
    }

    function btn(text, onclick, classes) {
        return '<button type="button" onclick="' + onclick + '" class="' + classes + '">' + text + '</button>';
    }

    function sectionLabel(text, colorClass) {
        return '<p class="' + UI.labelGray + " " + colorClass + '">' + text + '</p>';
    }

    /* ================================================================
       MODAL FUNCTIONS
       ================================================================ */

    function openLearnModal(startScenarioId, startStepIndex) {
        DOM.cacheDOM();
        if (!I.dom.overlay || !I.dom.contentArea) return;
        if (startScenarioId && SC.isUnlocked(startScenarioId)) {
            I.currentScenarioId = startScenarioId;
        }
        if (!I.currentScenarioId || !SC.isUnlocked(I.currentScenarioId)) {
            I.currentScenarioId = SC.firstPlayableScenario();
        }
        I.modalOpen = true;
        I.dom.overlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        window.setTimeout(function () {
            if (!I.dom.overlay) return;
            I.dom.overlay.classList.remove("opacity-0", "translate-y-full");
            I.dom.overlay.classList.add("opacity-100", "translate-y-0");
        }, 10);
        if (!I.state.introDone) {
            renderIntro();
            renderPage();
            return;
        }
        SC.startScenario(I.currentScenarioId, typeof startStepIndex === "number" ? startStepIndex : undefined, true);
    }

    function closeLearnModal() {
        if (!I.dom.overlay) return;
        I.modalOpen = false;
        I.dom.overlay.classList.remove("opacity-100", "translate-y-0");
        I.dom.overlay.classList.add("opacity-0", "translate-y-full");
        DOM.hideBubble();
        window.setTimeout(function () {
            if (!I.dom.overlay) return;
            I.dom.overlay.classList.add("hidden");
            document.body.style.overflow = "auto";
        }, 300);
    }

    function renderIntro() {
        if (!I.dom.contentArea) return;
        DOM.setMood("happy");
        if (I.dom.modalIcon) I.dom.modalIcon.innerHTML = ICONS.svg("happy", "1.25em");
        if (I.dom.modalTitle) I.dom.modalTitle.textContent = "Belajar dengan Bu Siti";
        if (I.dom.modalProgress) I.dom.modalProgress.innerHTML = "";
        if (I.dom.modalXp) I.dom.modalXp.textContent = I.state.xp + " XP";
        DOM.showBubble("Bu Siti", "Halo! Aku Bu Siti. Warungku ramai, tetapi pengelolaannya masih berantakan. Mau membantuku sambil belajar?", "happy");

        var html = "";
        html += '<div class="text-center">';
        html += '<h2 class="text-2xl font-bold text-black-main mb-3">Halo! Aku Bu Siti</h2>';
        html += '<p class="text-gray-600 leading-relaxed mb-5">Kita akan menyelesaikan 6 masalah nyata warung: stok, uang, harga, utang, promo, sampai rencana usaha besar.</p>';
        html += '<div class="bg-lime-main/25 border border-lime-main rounded-2xl p-4 mb-5 text-left">';
        html += '<p class="text-sm text-black-main font-semibold mb-1">Cara mainnya gampang</p>';
        html += '<p class="text-sm text-black-main/70 leading-relaxed">Ikuti cerita, pilih keputusan, lihat akibatnya, lalu praktekkan langsung di aplikasi Laku. Salah pilih tidak masalah, yang penting paham sebab-akibatnya.</p>';
        html += "</div>";
        html += btn("Mulai Perjalanan", "window.LakuLearn.startJourney()", UI.btnBrandLg);
        
        html += "</div>";

        I.dom.contentArea.innerHTML = html;
    }

    function startJourney() {
        I.state.introDone = true;
        try { localStorage.setItem(D.INTRO_KEY, "true"); } catch (e) { }
        S.saveState();
        if (!I.currentScenarioId || !SC.isUnlocked(I.currentScenarioId)) I.currentScenarioId = SC.firstPlayableScenario();
        SC.startScenario(I.currentScenarioId, 0, true);
    }

    /* ================================================================
       HEADER RENDERER
       ================================================================ */

    function renderHeaderProgress(scenario) {
        if (!I.dom.modalProgress) return;
        var dots = "";
        for (var i = 0; i < scenario.steps.length; i++) {
            var cls = i === I.currentStepIndex
                ? "w-7 h-2 rounded-full bg-[#274c43]"
                : i < I.currentStepIndex
                    ? "w-2 h-2 rounded-full bg-[#274c43]/50"
                    : "w-2 h-2 rounded-full bg-gray-300";
            dots += '<span class="' + cls + ' transition-all"></span>';
        }
        dots += '<span class="ml-2 text-xs font-semibold text-gray-500">Langkah ' + (I.currentStepIndex + 1) + "/" + scenario.steps.length + "</span>";
        I.dom.modalProgress.innerHTML = dots;
        if (I.dom.modalStep) I.dom.modalStep.textContent = "Langkah " + (I.currentStepIndex + 1) + "/" + scenario.steps.length;
        if (I.dom.modalXp) I.dom.modalXp.textContent = I.state.xp + " XP";
    }

    /* ================================================================
       STEP CONTENT RENDERERS
       ================================================================ */

    /* ── Choice Option Styling ── */

    function optionButtonClass(base, isCorrect, isWrong) {
        if (isCorrect) return base + " border-2 border-emerald-500 bg-emerald-50 shadow-sm";
        if (isWrong) return base + " border-2 border-rose-400 bg-rose-50 shadow-sm";
        if (I.selectedChoice) return base + " opacity-45";
        return base;
    }

    /* ── Dialogue Step ── */

    function renderDialogueContent(scenario, step) {
        // Resolve lines: use branchLines if available (fallback to path 0 when selectedChoice is null)
        var lines;
        if (step.branchLines) {
            var pathIndex = I.selectedChoice ? I.selectedChoice.index : 0;
            lines = step.branchLines[pathIndex] || step.branchLines[0] || step.lines;
        } else {
            lines = step.lines;
        }
        var line = lines[I.currentDialogueIndex] || lines[0];
        DOM.showBubble(line.speaker, line.text, line.mood || step.mood || "neutral");

        var html = "";
        html += '<div class="' + UI.card + '">';
        html += sectionLabel("Cerita " + (I.currentDialogueIndex + 1) + "/" + lines.length, "text-gray-500");
        html += '<h3 class="text-xl font-bold text-black-main leading-snug mb-2">' + esc(scenario.title) + "</h3>";
        html += '<p class="text-sm text-gray-600 leading-relaxed mb-4">' + esc(step.lead || "Ikuti percakapan ini sampai selesai.") + "</p>";
        html += '<div class="flex items-center justify-between text-xs text-gray-500 mb-4">';
        html += "<span>Bagian cerita " + (I.currentDialogueIndex + 1) + " dari " + lines.length + "</span>";
        html += "<span>" + esc(line.speaker) + " sedang bicara</span>";
        html += "</div>";
        var label = I.currentDialogueIndex < lines.length - 1 ? "Lanjut Cerita" : "Lanjut";
        html += '<div class="grid grid-cols-2 gap-2">';
        if (I.currentStepIndex > 0 || I.currentDialogueIndex > 0) html += btn("← Kembali", "window.LakuLearn.goBack()", UI.btnBack);
        else html += '<span></span>';
        html += btn(label, "window.LakuLearn.nextDialogue()", UI.btnPrimary);
        html += "</div></div>";
        return html;
    }

    /* ── Choice / Practice Step ── */

    function renderChoiceContent(scenario, step) {
        var html = "";
        html += '<div class="' + UI.card + '">';
        html += sectionLabel("Keputusanmu", "text-emerald-800");
        html += '<h3 class="text-xl font-bold text-black-main leading-snug mb-4">' + esc(step.question) + "</h3>";

        // Hint
        if (step.hint && !I.selectedChoice) {
            html += '<p class="text-xs text-gray-500 mb-4">Petunjuk: ' + esc(step.hint) + "</p>";
        }

        // Option buttons
        html += '<div class="space-y-3">';
        for (var i = 0; i < step.options.length; i++) {
            var option = step.options[i];
            var isCorrect = !!(I.selectedChoice && option.correct);
            var isWrong = !!(I.selectedChoice && I.selectedChoice.index === i && !option.correct);
            var icon = "";
            if (isCorrect) icon = '<span class="text-emerald-600 text-xl">' + ICONS.svg("check", "1.1em") + '</span>';
            if (isWrong) icon = '<span class="text-rose-500 text-xl">' + ICONS.svg("closeCircle", "1.1em") + '</span>';
            var onclick = I.selectedChoice ? "" : 'onclick="window.LakuLearn.chooseOption(' + i + ')"';
            var disabled = I.selectedChoice ? " disabled" : "";
            html += '<button type="button" ' + onclick + disabled + ' class="' + optionButtonClass(UI.optionBase, isCorrect, isWrong) + '">';
            html += '<span class="flex items-center justify-between gap-3">';
            html += '<span class="text-black-main font-semibold leading-snug">' + esc(option.label) + "</span>";
            html += icon;
            html += "</span></button>";
        }
        html += "</div>";

        // Feedback card after choice
        if (I.selectedChoice) {
            var chosen = step.options[I.selectedChoice.index];
            var heading = I.selectedChoice.correct ? "Tepat sekali!" : "Lihat akibat pilihanmu";
            var cardClass = I.selectedChoice.correct ? UI.successCard : UI.warningCard;
            html += '<div class="' + cardClass + '">';
            html += '<p class="font-bold text-black-main mb-1">' + heading + "</p>";
            html += '<p class="text-sm text-gray-700 leading-relaxed mb-2">' + esc(chosen.consequence) + "</p>";
            html += '<p class="text-sm text-gray-700 leading-relaxed">' + esc(chosen.feedback) + "</p>";
            if (I.selectedChoice.correct && I.selectedChoice.gained > 0) {
                html += '<p class="mt-2 text-sm font-bold text-emerald-700">+' + I.selectedChoice.gained + " XP</p>";
            }

            // Action buttons
            html += '<div class="mt-4 flex flex-col sm:flex-row gap-2">';
            if (!I.selectedChoice.correct && !I.selectedChoice.revealed) {
                html += btn("Coba Lagi", "window.LakuLearn.retryChoice()", UI.btnBrand);
                html += btn("Lihat Pelajaran", "window.LakuLearn.revealChoice()", UI.btnOutline);
            } else {
                if (I.currentStepIndex > 0 || I.currentDialogueIndex > 0) html += btn("← Kembali", "window.LakuLearn.goBack()", UI.btnBack);
                html += btn("Lanjut", "window.LakuLearn.nextStep()", UI.btnPrimary);
            }
            html += "</div></div>";
        }

        html += "</div>";
        return html;
    }

    /* ── Insight Step ── */

    function renderInsightContent(step) {
        // Resolve flavor: use path-specific body if available
        var body = step.body;
        var title = step.title;
        if (step.flavors && I.selectedChoice) {
            var flavor = step.flavors[I.selectedChoice.index];
            if (flavor) {
                if (flavor.body) body = flavor.body;
                if (flavor.title) title = flavor.title;
            }
        }
        var html = "";
        html += '<div class="' + UI.card + '">';
        html += sectionLabel("Kenapa begitu?", "text-amber-700");
        html += '<h3 class="text-xl font-bold text-black-main leading-snug mb-3">' + esc(title) + "</h3>";
        html += '<p class="text-sm text-gray-600 leading-relaxed mb-4">' + esc(body) + "</p>";
        if (step.points && step.points.length) {
            html += '<ul class="space-y-2">';
            for (var i = 0; i < step.points.length; i++) {
                html += '<li class="flex items-start gap-2 text-sm text-gray-700 leading-relaxed"><span class="mt-0.5 text-emerald-700">' + ICONS.svg("check", "0.85em") + '</span><span>' + esc(step.points[i]) + "</span></li>";
            }
            html += "</ul>";
        }
        html += '<div class="grid grid-cols-2 gap-2">';
        if (I.currentStepIndex > 0 || I.currentDialogueIndex > 0) html += btn("← Kembali", "window.LakuLearn.goBack()", UI.btnBack);
        else html += '<span></span>';
        html += btn("Lanjut", "window.LakuLearn.nextStep()", UI.btnPrimary);
        html += "</div></div>";
        return html;
    }

    /* ── Action Step ── */

    function renderActionContent(scenario, step) {
        var done = S.actionIsDone(scenario);
        var record = SC.getScenarioRecord(scenario.id);
        if (done && !record.actionBonus) {
            record.actionDone = true;
            record.actionBonus = true;
            S.addXp(8);
            S.saveState();
        }
        var link = "app.html?open=" + scenario.appKey + "&return=learn&scenario=" + scenario.id;
        try { localStorage.setItem(D.RETURN_KEY, JSON.stringify({ scenario: scenario.id, at: Date.now() })); } catch (e) { }
        DOM.showBubble("Bu Siti", step.bubble, step.mood || "happy");

        var html = "";
        html += '<div class="' + UI.card + '">';
        html += sectionLabel("Praktek langsung", "text-emerald-800");
        html += '<h3 class="text-xl font-bold text-black-main leading-snug mb-3">Coba di aplikasi Laku</h3>';

        // Status indicator
        if (done) {
            html += '<div class="' + UI.successSm + '">';
            html += '<span class="text-emerald-700 text-lg">' + ICONS.svg("checkCircle", "1.2em") + '</span>';
            html += '<p class="text-sm font-semibold text-emerald-800 leading-relaxed">' + esc(step.statusDone) + "</p>";
            html += "</div>";
        } else {
            html += '<div class="' + UI.warningSm + '">';
            html += '<span class="text-amber-700 text-lg">' + ICONS.svg("arrowRight", "1.2em") + '</span>';
            html += '<p class="text-sm font-semibold text-amber-800 leading-relaxed">' + esc(step.statusTodo) + "</p>";
            html += "</div>";
        }

        // Go to app button
        html += '<a href="' + link + '" class="' + UI.btnBrandLink + '">' + esc(step.buttonLabel) + "</a>";

        // Secondary buttons
        html += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">';
        // html += btn("Cek Status", "window.LakuLearn.refreshAction()", UI.btnSm);
        html += btn("Lanjut", "window.LakuLearn.nextStep()", UI.btnPrimary);
        if (I.currentStepIndex > 0) html += btn("← Kembali", "window.LakuLearn.goBack()", UI.btnBack);
        html += "</div>";

        html += '<p class="mt-3 text-xs text-gray-500 leading-relaxed">Setelah mencoba di aplikasi, kembali ke halaman ini lalu tekan Cek Status. Praktik tidak wajib, tetapi memberi bonus XP.</p>';
        html += "</div>";
        return html;
    }

    /* ── Result Step ── */

    function renderResultContent(scenario, step) {
        var record = SC.getScenarioRecord(scenario.id);
        var justCompleted = !record.completed;
        if (justCompleted) {
            record.completed = true;
            S.addXp(20);
            S.touchStreak();
            var index = SC.getScenarioIndex(scenario.id);
            if (index >= 0 && index < D.SCENARIO_ORDER.length - 1) {
                var nextId = D.SCENARIO_ORDER[index + 1];
                if (I.state.unlocked.indexOf(nextId) === -1) I.state.unlocked.push(nextId);
            }
            S.saveState();
        }
        DOM.showBubble("Bu Siti", step.bubble, step.mood || "proud");

        var html = "";
        html += '<div class="text-center ' + UI.card + '">';
        // Celebration icons removed (replaced with SVG)
        html += '<div class="badge-unlock inline-flex items-center gap-3 bg-lime-main/40 border border-lime-main px-5 py-2.5 rounded-full mb-4">';
        html += '<span class="text-3xl">' + ICONS.svg(scenario.badge.icon, "1.5em") + "</span>";
        html += '<span class="font-bold text-black-main text-lg">' + esc(scenario.badge.name) + "</span>";
        html += "</div>";
        html += '<h3 class="text-2xl font-bold text-black-main mb-2">Skenario Selesai!</h3>';
        html += '<p class="text-sm text-gray-600 leading-relaxed mb-3">' + esc(step.closing) + "</p>";
        html += '<p class="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">' + esc(scenario.warung) + "</p>";
        html += '<p class="text-sm text-gray-500 mb-5">' + SC.completedCount() + " dari 6 skenario selesai • +" + (justCompleted ? 20 : 0) + " XP</p>";

        // Next scenario button
        var nextIndex = SC.getScenarioIndex(scenario.id) + 1;
        if (nextIndex < D.SCENARIO_ORDER.length) {
            var nextScenario = D.getScenario(D.SCENARIO_ORDER[nextIndex]);
            var locked = !SC.isUnlocked(nextScenario.id);
            var onclick = locked ? "" : 'onclick="window.LakuLearn.goToScenario(' + nextIndex + ')"';
            var disabled = locked ? " disabled" : "";
            html += '<button type="button" ' + onclick + disabled + ' class="' + UI.btnPrimary + " text-lg mb-2 disabled:opacity-45\">" + ICONS.svg(nextScenario.icon, "1em") + " " + esc(nextScenario.title) + "</button>";
        } else {
            html += '<div class="bg-lime-main/30 border border-lime-main rounded-2xl p-5 mb-2">';
            html += '<p class="text-lg font-bold text-black-main mb-1">Semua skenario selesai!</p>';
            html += '<p class="text-sm text-gray-600">Bu Siti bangga. Warungnya tertata dari stok sampai rencana usaha besar.</p>';
            html += "</div>";
        }

        // Bottom actions
        html += '<div class="grid grid-cols-2 gap-2">';
        html += btn("Ulangi", "window.LakuLearn.goToScenario(" + SC.getScenarioIndex(scenario.id) + ")", UI.btnSm);
        html += btn("Tutup", "window.LakuLearn.close()", UI.btnBrand);
        html += "</div></div>";
        return html;
    }

    /* ================================================================
       MASTER STEP RENDERER
       ================================================================ */

    function renderStep() {
        if (!I.modalOpen) return;
        var scenario = D.getScenario(I.currentScenarioId);
        if (!scenario) return;
        if (I.currentStepIndex < 0) I.currentStepIndex = 0;
        if (I.currentStepIndex >= scenario.steps.length) I.currentStepIndex = scenario.steps.length - 1;
        var record = SC.getScenarioRecord(scenario.id);
        S.saveSession(I.currentScenarioId, I.currentStepIndex, I.currentDialogueIndex, I.selectedChoice);

        var step = scenario.steps[I.currentStepIndex];
        if (I.dom.modalIcon) I.dom.modalIcon.innerHTML = ICONS.svg(scenario.icon, "1.25em");
        if (I.dom.modalTitle) I.dom.modalTitle.textContent = scenario.title;
        renderHeaderProgress(scenario);

        // Scenario info line
        var html = "";
        // html += '<p class="text-center text-xs font-semibold text-gray-500 mb-3">Skenario ' + (SC.getScenarioIndex(scenario.id) + 1) + " dari 6 • " + esc(scenario.skill) + "</p>";

        // Step type dispatch
        if (step.type === "dialogue") {
            html += renderDialogueContent(scenario, step);
        } else if (step.type === "choice" || step.type === "practice") {
            if (!I.selectedChoice) DOM.showBubble("Bu Siti", step.question, step.mood || "thinking");
            html += renderChoiceContent(scenario, step);
        } else if (step.type === "insight") {
            DOM.showBubble("Bu Siti", "Ini penjelasannya. Pelan-pelan saja, tidak perlu dihafal.", step.mood || "relieved");
            html += renderInsightContent(step);
        } else if (step.type === "action") {
            html += renderActionContent(scenario, step);
        } else if (step.type === "result") {
            html += renderResultContent(scenario, step);
        }

        if (I.dom.contentArea) {
            I.dom.contentArea.innerHTML = html;
            if (I.dom.overlay) I.dom.overlay.scrollTop = 0;
        }
        renderPage();
    }

    /* ================================================================
       LANDING PAGE RENDERERS
       ================================================================ */

    /* ── Scenario Card Status ── */

    function scenarioCardStatus(id) {
        var record = SC.getScenarioRecord(id);
        if (record.completed) return "done";
        if (SC.isUnlocked(id)) return "open";
        return "locked";
    }

    /* ── Scenario Path ── */

    function renderPath() {
        if (!I.dom.path) return;
        var html = "";
        for (var i = 0; i < D.SCENARIOS.length; i++) {
            var scenario = D.SCENARIOS[i];
            var status = scenarioCardStatus(scenario.id);
            var record = SC.getScenarioRecord(scenario.id);

            var card = "relative overflow-hidden rounded-3xl border p-5 text-left transition-all ";
            if (status === "done") card += "border-emerald-200 bg-emerald-50/70 shadow-sm";
            else if (status === "open") card += "border-gray-100 bg-white shadow-xl hover:-translate-y-1 hover:shadow-2xl";
            else card += "border-gray-100 bg-gray-50 opacity-75";

            var buttonAttrs = status !== "locked"
                ? 'onclick="window.LakuLearn.openScenario(\'' + scenario.id + '\')"'
                : "disabled";

            html += "<button type=\"button\" " + buttonAttrs + ' class="' + card + '">';
            html += '<span class="absolute right-4 top-4 text-2xl">' + (status === "done" ? ICONS.svg("checkCircle", "1.3em") : status === "open" ? ICONS.svg("play", "1.3em") : ICONS.svg("lock", "1.3em")) + "</span>";
            html += '<span class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-800 bg-lime-main/50 px-3 py-1 rounded-full mb-3">' + ICONS.svg(scenario.icon, "1em") + " Skenario " + (i + 1) + "</span>";
            html += '<span class="block text-xl font-bold text-black-main leading-snug mb-1">' + esc(scenario.title) + "</span>";
            html += '<span class="block text-sm text-gray-600 leading-relaxed mb-3">' + esc(scenario.goal) + "</span>";
            html += '<span class="flex items-center justify-between text-xs font-semibold text-gray-500">';
            html += "<span>" + (record.completed ? "Selesai" : status === "open" ? "Mainkan" : "Terkunci") + "</span>";
            html += "</span></button>";
        }
        I.dom.path.innerHTML = html;
    }

    /* ── Badge Gallery ── */

    function renderBadges() {
        if (!I.dom.badges) return;
        var html = "";
        for (var i = 0; i < D.SCENARIOS.length; i++) {
            var scenario = D.SCENARIOS[i];
            var done = SC.getScenarioRecord(scenario.id).completed;
            var cardClass = done ? "border-lime-main bg-lime-main/25 shadow-sm" : "border-gray-100 bg-white opacity-70";
            html += '<div class="rounded-3xl border p-4 text-center ' + cardClass + '">';
            html += '<div class="text-3xl mb-2">' + (done ? ICONS.svg(scenario.badge.icon, "1.5em") : ICONS.svg("lock", "1.5em")) + "</div>";
            html += '<p class="font-bold text-black-main text-sm leading-tight mb-1">' + esc(scenario.badge.name) + "</p>";
            html += '<p class="text-xs text-gray-500">' + esc(scenario.title) + "</p>";
            html += "</div>";
        }
        I.dom.badges.innerHTML = html;
    }

    /* ── Warung Visual ── */

    function renderWarung() {
        if (!I.dom.warung) return;
        var done = SC.completedCount();
        var layers = [
            { icon: "washingMachine", label: "Rak stok rapi", need: 1 },
            { icon: "book", label: "Buku kas", need: 2 },
            { icon: "tag", label: "Label harga", need: 3 },
            { icon: "handshake", label: "Buku utang", need: 4 },
            { icon: "flag", label: "Banner promo", need: 5 },
            { icon: "partyPopper", label: "Pelanggan ramai", need: 6 }
        ];
        var html = "";
        html += '<div class="' + UI.brandCard + '">';
        html += '<p class="text-xs font-bold uppercase tracking-widest text-lime-300 mb-1">Warung Bu Siti</p>';
        html += '<h3 class="text-2xl font-bold leading-snug mb-2">Setiap pelajaran membuat warung makin hidup</h3>';
        html += '<p class="text-sm text-white/75 leading-relaxed mb-4">Selesaikan skenario untuk membuka rak, buku kas, label harga, banner, sampai pelanggan yang ramai.</p>';
        html += '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">';
        for (var i = 0; i < layers.length; i++) {
            var active = done >= layers[i].need;
            var cell = active ? "bg-white/15 border-white/25" : "bg-black/20 border-white/10 opacity-55";
            html += '<div class="rounded-2xl p-3 text-center border ' + cell + '">';
            html += '<div class="text-2xl mb-1">' + (active ? ICONS.svg(layers[i].icon, "1.3em") : ICONS.svg("lock", "1.3em")) + "</div>";
            html += '<p class="text-xs font-semibold leading-tight">' + esc(layers[i].label) + "</p>";
            html += "</div>";
        }
        html += "</div></div>";
        I.dom.warung.innerHTML = html;
        if (I.dom.warungLabel) I.dom.warungLabel.textContent = done + "/6 bagian warung terbuka";
    }

    /* ── Readiness Checklist ── */

    function renderChecklist() {
        if (!I.dom.checklist) return;
        var html = "";
        var checked = 0;
        for (var i = 0; i < D.READINESS_ITEMS.length; i++) {
            var item = D.READINESS_ITEMS[i];
            var value = !!I.state.checklist[item.id];
            if (value) checked += 1;
            var cardClass = value ? "border-emerald-200 bg-emerald-50/70" : "border-gray-100 bg-white hover:border-[#274c43]";
            var checkClass = value ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400";
            var checkIcon = value ? ICONS.svg("check", "0.9em") : "";
            html += '<button type="button" onclick="window.LakuLearn.toggleChecklist(\'' + item.id + '\')" class="w-full flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ' + cardClass + '">';
            html += '<span class="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-base ' + checkClass + '">' + checkIcon + "</span>";
            html += '<span><span class="block font-bold text-black-main text-sm leading-snug">' + esc(item.text) + "</span>";
            html += '<span class="block text-xs text-gray-500 mt-1">Terkait: ' + esc(item.app) + "</span></span>";
            html += "</button>";
        }
        I.dom.checklist.innerHTML = html;
        if (I.dom.checklistSummary) {
            var message = checked <= 3
                ? "Kamu masih di awal perjalanan. Mulai dari Skenario 1."
                : checked <= 6
                    ? "Lumayan! Tinggal sedikit lagi agar usaha makin tertata."
                    : "Luar biasa! Bisnismu sudah sangat tertata.";
            I.dom.checklistSummary.textContent = checked + "/8 selesai • " + message;
        }
    }

    /* ── Hero Stats ── */

    function renderHero() {
        var done = SC.completedCount();
        if (I.dom.heroProgress) I.dom.heroProgress.textContent = done + "/6 skenario";
        if (I.dom.heroXp) I.dom.heroXp.textContent = I.state.xp + " XP";
        if (I.dom.heroLevel) I.dom.heroLevel.textContent = "Level " + I.state.level + " • " + S.levelName(I.state.level);
        if (I.dom.heroStreak) I.dom.heroStreak.textContent = I.state.streak.count > 0 ? I.state.streak.count + " hari belajar" : "Mulai streak hari ini";
    }

    /* ── Full Page Refresh ── */

    function renderPage() {
        DOM.cacheDOM();
        renderHero();
        renderPath();
        renderBadges();
        renderWarung();
        renderChecklist();
    }

    /* ================================================================
       PUBLIC API
       ================================================================ */

    window.LakuLearnRender = {
        openLearnModal: openLearnModal,
        closeLearnModal: closeLearnModal,
        renderIntro: renderIntro,
        startJourney: startJourney,
        renderHeaderProgress: renderHeaderProgress,
        renderDialogueContent: renderDialogueContent,
        renderChoiceContent: renderChoiceContent,
        renderInsightContent: renderInsightContent,
        renderActionContent: renderActionContent,
        renderResultContent: renderResultContent,
        optionButtonClass: optionButtonClass,
        renderStep: renderStep,
        scenarioCardStatus: scenarioCardStatus,
        renderPath: renderPath,
        renderBadges: renderBadges,
        renderWarung: renderWarung,
        renderChecklist: renderChecklist,
        renderHero: renderHero,
        renderPage: renderPage
    };
})();
