/**
 * learnScenario.js — Navigation & choice logic for the Learn module
 *
 * Manages scenario lifecycle (start, navigate, choose, retry, reveal)
 * and unlock/completion tracking.
 *
 * Forward reference: calls window.LakuLearnRender.renderStep() at runtime
 * because learnRender.js loads after this file.
 *
 * Dependencies: LakuLearnData (constants, getScenario, createEmptyScenarioRecord),
 *               LakuLearnState (touchStreak, addXp, saveState),
 *               LakuLearnDOM (showBubble)
 * Exports: window.LakuLearnScenario
 */
(function () {
    "use strict";

    var D = window.LakuLearnData;
    var S = window.LakuLearnState;
    var DOM = window.LakuLearnDOM;
    var I = window.LakuLearnInternal;

    /* ── Scenario Lookup ── */

    function getScenarioIndex(id) {
        return D.SCENARIO_ORDER.indexOf(id);
    }

    function getScenarioRecord(id) {
        if (!I.state.scenarios[id]) I.state.scenarios[id] = D.createEmptyScenarioRecord();
        return I.state.scenarios[id];
    }

    /* ── Unlock & Completion ── */

    function isUnlocked(id) {
        if (id === "s1") return true;
        if (I.state.unlocked.indexOf(id) !== -1) return true;
        var index = getScenarioIndex(id);
        if (index > 0) return getScenarioRecord(D.SCENARIO_ORDER[index - 1]).completed;
        return false;
    }

    function completedCount() {
        var count = 0;
        for (var i = 0; i < D.SCENARIO_ORDER.length; i++) {
            if (getScenarioRecord(D.SCENARIO_ORDER[i]).completed) count += 1;
        }
        return count;
    }

    /* ── Scenario Navigation ── */

    function startScenario(id, stepIndex, resetDialogue) {
        var scenario = D.getScenario(id);
        if (!scenario || !isUnlocked(id)) return;
        I.currentScenarioId = id;
        var session = S.loadSession();
        var resumeStep = typeof stepIndex === "number" ? stepIndex : (session.scenarioId === id ? session.stepIndex : 0);
        var record = getScenarioRecord(id);
        if (record.completed && typeof stepIndex !== "number") resumeStep = 0;
        I.currentStepIndex = resumeStep;
        if (I.currentStepIndex < 0) I.currentStepIndex = 0;
        if (I.currentStepIndex >= scenario.steps.length) I.currentStepIndex = scenario.steps.length - 1;
        I.currentDialogueIndex = (session.scenarioId === id && typeof stepIndex !== "number") ? session.dialogueIndex : 0;
        I.selectedChoice = (session.scenarioId === id) ? session.selectedChoice : null;
        I.choiceAttempts = 0;
        if (resetDialogue !== false) I.currentDialogueIndex = 0;
        S.touchStreak();
        S.saveSession(I.currentScenarioId, I.currentStepIndex, I.currentDialogueIndex, I.selectedChoice);
        window.LakuLearnRender.renderStep();
    }

    function goToScenario(index) {
        if (index < 0 || index >= D.SCENARIO_ORDER.length) return;
        var id = D.SCENARIO_ORDER[index];
        if (!isUnlocked(id)) return;
        startScenario(id, 0, true);
    }

    function goBack() {
        if (I.currentDialogueIndex > 0) {
            I.currentDialogueIndex -= 1;
            S.saveSession(I.currentScenarioId, I.currentStepIndex, I.currentDialogueIndex, I.selectedChoice);
            window.LakuLearnRender.renderStep();
            return;
        }
        if (I.currentStepIndex <= 0) return;
        var scenario = D.getScenario(I.currentScenarioId);
        if (!scenario) return;
        var prevIndex = I.currentStepIndex - 1;
        var prevStepData = scenario.steps[prevIndex];
        I.currentStepIndex = prevIndex;
        // Position at the last dialogue line of the previous step
        if (prevStepData && prevStepData.type === "dialogue") {
            var lines;
            if (prevStepData.branchLines) {
                var pathIndex = I.selectedChoice ? I.selectedChoice.index : 0;
                lines = prevStepData.branchLines[pathIndex] || prevStepData.branchLines[0] || prevStepData.lines;
            } else {
                lines = prevStepData.lines;
            }
            I.currentDialogueIndex = lines ? lines.length - 1 : 0;
        } else {
            I.currentDialogueIndex = 0;
        }
        // Reset choice state if entering a choice step
        if (prevStepData && (prevStepData.type === "choice" || prevStepData.type === "practice")) {
            I.selectedChoice = null;
            I.choiceAttempts = 0;
        }
        S.saveSession(I.currentScenarioId, I.currentStepIndex, I.currentDialogueIndex, I.selectedChoice);
        window.LakuLearnRender.renderStep();
    }

    function goStep(index) {
        var scenario = D.getScenario(I.currentScenarioId);
        if (!scenario) return;
        if (index < 0 || index >= scenario.steps.length) return;
        I.currentStepIndex = index;
        I.currentDialogueIndex = 0;
        // Only reset choice state when entering a new choice/practice step,
        // not when advancing from a choice to a branch dialogue
        var nextStep = scenario.steps[index];
        if (nextStep && (nextStep.type === "choice" || nextStep.type === "practice")) {
            I.selectedChoice = null;
            I.choiceAttempts = 0;
        }
        S.saveSession(I.currentScenarioId, I.currentStepIndex, I.currentDialogueIndex, I.selectedChoice);
        window.LakuLearnRender.renderStep();
    }

    function nextStep() {
        var scenario = D.getScenario(I.currentScenarioId);
        if (!scenario) return;
        var step = scenario.steps[I.currentStepIndex];
        if (!step) return;
        if (step.type === "dialogue") {
            nextDialogue();
            return;
        }
        if ((step.type === "choice" || step.type === "practice") && !I.selectedChoice) return;
        if (I.currentStepIndex < scenario.steps.length - 1) goStep(I.currentStepIndex + 1);
    }

    function nextDialogue() {
        var scenario = D.getScenario(I.currentScenarioId);
        if (!scenario) return;
        var step = scenario.steps[I.currentStepIndex];
        if (!step || step.type !== "dialogue") return;
        // Resolve lines: use branchLines if available (fallback to path 0 when selectedChoice is null)
        var lines;
        if (step.branchLines) {
            var pathIndex = I.selectedChoice ? I.selectedChoice.index : 0;
            lines = step.branchLines[pathIndex] || step.branchLines[0] || step.lines;
        } else {
            lines = step.lines;
        }
        if (!lines) return;
        if (I.currentDialogueIndex < lines.length - 1) {
            I.currentDialogueIndex += 1;
            S.saveSession(I.currentScenarioId, I.currentStepIndex, I.currentDialogueIndex, I.selectedChoice);
            window.LakuLearnRender.renderStep();
            return;
        }
        goStep(I.currentStepIndex + 1);
    }

    /* ── Choice Logic ── */

    function chooseOption(optionIndex) {
        var scenario = D.getScenario(I.currentScenarioId);
        if (!scenario) return;
        var step = scenario.steps[I.currentStepIndex];
        if (!step || (step.type !== "choice" && step.type !== "practice")) return;
        if (I.selectedChoice) return;
        var option = step.options[optionIndex];
        if (!option) return;
        var record = getScenarioRecord(scenario.id);
        I.selectedChoice = { index: optionIndex, correct: option.correct === true, revealed: false, gained: 0 };
        I.choiceAttempts += 1;
        record.attempts += 1;
        if (I.selectedChoice.correct) {
            var firstTry = I.choiceAttempts === 1;
            var gained = typeof option.xp === "number" ? option.xp : (firstTry ? 10 : 6);
            I.selectedChoice.gained = S.addXp(gained);
            record.bestScore = Math.max(record.bestScore, gained);
            DOM.showBubble("Bu Siti", option.feedback, "happy");
        } else {
            if (I.choiceAttempts >= D.MAX_CHOICE_ATTEMPTS) I.selectedChoice.revealed = true;
            DOM.showBubble("Bu Siti", option.consequence, "worried");
        }
        S.saveState();
        S.saveSession(I.currentScenarioId, I.currentStepIndex, I.currentDialogueIndex, I.selectedChoice);
        window.LakuLearnRender.renderStep();
    }

    function retryChoice() {
        I.selectedChoice = null;
        window.LakuLearnRender.renderStep();
    }

    function revealChoice() {
        if (!I.selectedChoice) return;
        I.selectedChoice.revealed = true;
        var scenario = D.getScenario(I.currentScenarioId);
        var step = scenario ? scenario.steps[I.currentStepIndex] : null;
        if (step && step.options) {
            for (var i = 0; i < step.options.length; i++) {
                if (step.options[i].correct) {
                    DOM.showBubble("Bu Siti", "Tidak apa-apa. Ini memang sering terjadi. " + step.options[i].feedback, "relieved");
                    break;
                }
            }
        }
        window.LakuLearnRender.renderStep();
    }

    function firstPlayableScenario() {
        for (var i = 0; i < D.SCENARIO_ORDER.length; i++) {
            var id = D.SCENARIO_ORDER[i];
            if (isUnlocked(id) && !getScenarioRecord(id).completed) return id;
        }
        return "s1";
    }

    /* ── Public API ── */

    window.LakuLearnScenario = {
        getScenario: D.getScenario,
        getScenarioIndex: getScenarioIndex,
        getScenarioRecord: getScenarioRecord,
        isUnlocked: isUnlocked,
        completedCount: completedCount,
        startScenario: startScenario,
        goToScenario: goToScenario,
        goStep: goStep,
        nextStep: nextStep,
        nextDialogue: nextDialogue,
        goBack: goBack,
        chooseOption: chooseOption,
        retryChoice: retryChoice,
        revealChoice: revealChoice,
        firstPlayableScenario: firstPlayableScenario
    };
})();
