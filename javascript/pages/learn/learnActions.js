/**
 * learnActions.js — User action handlers for the Learn module
 *
 * Handles scenario opening, action refresh/completion, checklist toggling,
 * progress reset, and deep-link query parameter handling.
 *
 * Dependencies: LakuLearnData (constants, getScenario),
 *               LakuLearnState (addXp, saveState, normalizeState),
 *               LakuLearnScenario (isUnlocked, getScenarioRecord, getScenario),
 *               LakuLearnRender (renderStep, renderChecklist, renderPage, openLearnModal)
 * Exports: window.LakuLearnActions
 */
(function () {
    "use strict";

    var D = window.LakuLearnData;
    var S = window.LakuLearnState;
    var SC = window.LakuLearnScenario;
    var R = window.LakuLearnRender;
    var I = window.LakuLearnInternal;

    function openScenario(id) {
        if (!SC.isUnlocked(id)) return;
        if (!I.modalOpen) R.openLearnModal(id, 0);
        else SC.startScenario(id, 0, true);
    }

    function refreshAction() {
        R.renderStep();
    }

    function completeAction() {
        var scenario = D.getScenario(I.currentScenarioId);
        if (!scenario) return;
        var record = SC.getScenarioRecord(scenario.id);
        record.actionDone = true;
        if (record.actionBonus !== true) {
            record.actionBonus = true;
            S.addXp(5);
        }
        S.saveState();
        R.renderStep();
    }

    function toggleChecklist(id) {
        I.state.checklist[id] = !I.state.checklist[id];
        S.saveState();
        R.renderChecklist();
    }

    function resetProgress() {
        I.state = S.normalizeState(null);
        try {
            localStorage.removeItem(D.LEGACY_KEY);
            localStorage.removeItem(D.INTRO_KEY);
        } catch (e) { }
        S.saveState();
        R.renderPage();
    }

    function maybeOpenFromQuery() {
        try {
            var params = new URLSearchParams(window.location.search);
            var resume = params.get("scenario");
            if (!resume) return;
            var scenario = D.getScenario(resume);
            if (!scenario || !SC.isUnlocked(resume)) return;
            var actionIndex = -1;
            for (var i = 0; i < scenario.steps.length; i++) {
                if (scenario.steps[i].type === "action") {
                    actionIndex = i;
                    break;
                }
            }
            R.openLearnModal(resume, actionIndex >= 0 ? actionIndex : 0);
        } catch (e) { }
    }

    window.LakuLearnActions = {
        openScenario: openScenario,
        refreshAction: refreshAction,
        completeAction: completeAction,
        toggleChecklist: toggleChecklist,
        resetProgress: resetProgress,
        maybeOpenFromQuery: maybeOpenFromQuery
    };
})();
