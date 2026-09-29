
(function () {
    "use strict";
    var D = window.LakuLearnData;
    var I = window.LakuLearnInternal = window.LakuLearnInternal || {};

    function cloneChecklist(source) {
        var output = {};
        for (var i = 0; i < D.READINESS_ITEMS.length; i++) {
            output[D.READINESS_ITEMS[i].id] = !!(source && source[D.READINESS_ITEMS[i].id]);
        }
        return output;
    }

    function normalizeState(raw) {
        var normalized = {
            version: 2,
            introDone: false,
            xp: 0,
            level: 1,
            streak: { count: 0, lastDate: null },
            scenarios: {},
            unlocked: ["s1"],
            checklist: cloneChecklist(null)
        };
        if (raw && typeof raw === "object") {
            if (raw.introDone === true) normalized.introDone = true;
            if (typeof raw.xp === "number" && raw.xp > 0) normalized.xp = Math.floor(raw.xp);
            if (raw.streak && typeof raw.streak === "object") {
                if (typeof raw.streak.count === "number" && raw.streak.count > 0) normalized.streak.count = Math.floor(raw.streak.count);
                if (typeof raw.streak.lastDate === "string") normalized.streak.lastDate = raw.streak.lastDate;
            }
            if (raw.scenarios && typeof raw.scenarios === "object") {
                var keys = Object.keys(raw.scenarios);
                for (var i = 0; i < keys.length; i++) {
                    var item = raw.scenarios[keys[i]];
                    if (!item || typeof item !== "object") continue;
                    normalized.scenarios[keys[i]] = {
                        completed: item.completed === true,
                        bestScore: typeof item.bestScore === "number" ? item.bestScore : 0,
                        attempts: typeof item.attempts === "number" ? item.attempts : 0,
                        actionDone: item.actionDone === true,
                        actionBonus: item.actionBonus === true
                    };
                }
            }
            if (Array.isArray(raw.unlocked)) normalized.unlocked = raw.unlocked.slice();
            if (raw.checklist && typeof raw.checklist === "object") normalized.checklist = cloneChecklist(raw.checklist);
        }
        for (var s = 0; s < D.SCENARIO_ORDER.length; s++) {
            var id = D.SCENARIO_ORDER[s];
            if (!normalized.scenarios[id]) normalized.scenarios[id] = D.createEmptyScenarioRecord();
        }
        try {
            if (localStorage.getItem(D.INTRO_KEY) === "true") normalized.introDone = true;
        } catch (e) { }
        try {
            var legacyRaw = localStorage.getItem(D.LEGACY_KEY);
            if (legacyRaw) {
                var legacy = JSON.parse(legacyRaw);
                for (var l = 0; l < D.SCENARIO_ORDER.length; l++) {
                    var legacyId = D.SCENARIO_ORDER[l];
                    if (legacy[legacyId] === true) normalized.scenarios[legacyId].completed = true;
                }
            }
        } catch (e) { }
        if (normalized.unlocked.indexOf("s1") === -1) normalized.unlocked.unshift("s1");
        for (var u = 0; u < D.SCENARIO_ORDER.length - 1; u++) {
            if (normalized.scenarios[D.SCENARIO_ORDER[u]].completed && normalized.unlocked.indexOf(D.SCENARIO_ORDER[u + 1]) === -1) {
                normalized.unlocked.push(D.SCENARIO_ORDER[u + 1]);
            }
        }
        normalized.level = levelForXp(normalized.xp);
        return normalized;
    }

    function loadState() {
        try {
            var raw = localStorage.getItem(D.STORAGE_KEY);
            if (raw) return normalizeState(JSON.parse(raw));
        } catch (e) { }
        return normalizeState(null);
    }

    function saveState() {
        try {
            localStorage.setItem(D.STORAGE_KEY, JSON.stringify(I.state));
        } catch (e) { }
    }

    /* ── Session Storage (step/dialogue position) ── */

    function loadSession() {
        try {
            var raw = sessionStorage.getItem(D.SESSION_KEY);
            if (raw) {
                var data = JSON.parse(raw);
                return {
                    scenarioId: data.scenarioId || null,
                    stepIndex: typeof data.stepIndex === "number" ? data.stepIndex : 0,
                    dialogueIndex: typeof data.dialogueIndex === "number" ? data.dialogueIndex : 0,
                    selectedChoice: data.selectedChoice || null
                };
            }
        } catch (e) { }
        return { scenarioId: null, stepIndex: 0, dialogueIndex: 0, selectedChoice: null };
    }

    function saveSession(scenarioId, stepIndex, dialogueIndex, selectedChoice) {
        try {
            sessionStorage.setItem(D.SESSION_KEY, JSON.stringify({
                scenarioId: scenarioId,
                stepIndex: stepIndex,
                dialogueIndex: dialogueIndex,
                selectedChoice: selectedChoice || null
            }));
        } catch (e) { }
    }

    function clearSession() {
        try {
            sessionStorage.removeItem(D.SESSION_KEY);
        } catch (e) { }
    }

    /* ── Gamification ── */

    function levelForXp(xp) {
        return Math.floor(Math.max(0, xp) / D.XP_LEVEL_STEP) + 1;
    }

    function levelName(level) {
        var names = ["Pemula Warung", "Penata Stok", "Jago Catat", "Cerdas Modal", "Pandai Warung", "Jago Promo", "Ratu UMKM"];
        return names[Math.min(Math.max(1, level) - 1, names.length - 1)];
    }

    function todayString() {
        var now = new Date();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        return now.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
    }

    function yesterdayString() {
        var now = new Date();
        now.setDate(now.getDate() - 1);
        var month = now.getMonth() + 1;
        var day = now.getDate();
        return now.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
    }

    function touchStreak() {
        var today = todayString();
        if (I.state.streak.lastDate === today) return;
        if (I.state.streak.lastDate === yesterdayString()) {
            I.state.streak.count += 1;
        } else {
            I.state.streak.count = 1;
        }
        I.state.streak.lastDate = today;
        saveState();
    }

    function addXp(amount) {
        var clean = Math.floor(Number(amount) || 0);
        if (clean <= 0) return 0;
        I.state.xp += clean;
        var nextLevel = levelForXp(I.state.xp);
        if (nextLevel > I.state.level) I.state.level = nextLevel;
        saveState();
        return clean;
    }

    /* ── App Data Integration ── */

    function hasAppData(key) {
        if (!key) return false;
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return false;
            var parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.length > 0;
            if (parsed && typeof parsed === "object") return Object.keys(parsed).length > 0;
            return false;
        } catch (e) {
            return false;
        }
    }

    function actionIsDone(scenario) {
        var record;
        if (I.state.scenarios[scenario.id]) {
            record = I.state.scenarios[scenario.id];
        } else {
            record = D.createEmptyScenarioRecord();
            I.state.scenarios[scenario.id] = record;
        }
        if (record.actionDone) return true;
        if (scenario.storageKey && hasAppData(scenario.storageKey)) {
            record.actionDone = true;
            saveState();
            return true;
        }
        return false;
    }

    window.LakuLearnState = {
        loadState: loadState,
        saveState: saveState,
        loadSession: loadSession,
        saveSession: saveSession,
        clearSession: clearSession,
        normalizeState: normalizeState,
        addXp: addXp,
        touchStreak: touchStreak,
        levelForXp: levelForXp,
        levelName: levelName,
        hasAppData: hasAppData,
        actionIsDone: actionIsDone,
        todayString: todayString,
        yesterdayString: yesterdayString
    };
})();
