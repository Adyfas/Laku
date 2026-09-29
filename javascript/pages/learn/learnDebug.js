(function () {
    "use strict";

    var D = window.LakuLearnData;
    var I = window.LakuLearnInternal;

    var panel = null;
    var visible = false;



    function scenarioOptions() {
        var html = '<option value="">-- Skenario --</option>';
        var list = D.SCENARIOS || [];
        for (var i = 0; i < list.length; i++) {
            html += '<option value="' + list[i].id + '">' + (i + 1) + '. ' + list[i].id + ' — ' + list[i].title + '</option>';
        }
        return html;
    }

    function stepOptions(scenarioId) {
        if (!scenarioId) return '<option value="">-- Step --</option>';
        var sc = D.getScenario(scenarioId);
        if (!sc) return '<option value="">-- Step --</option>';
        var html = '<option value="">-- Step --</option>';
        for (var i = 0; i < sc.steps.length; i++) {
            var s = sc.steps[i];
            var label = i + '. [' + s.type + ']';
            if (s.branchLines) label += ' (branch)';
            if (s.lines) label += ' (' + s.lines.length + ' lines)';
            html += '<option value="' + i + '">' + label + '</option>';
        }
        return html;
    }

    function dialogueOptions(scenarioId, stepIndex) {
        if (!scenarioId || stepIndex === "" || stepIndex === undefined) return '<option value="">-- Dialogue --</option>';
        var sc = D.getScenario(scenarioId);
        if (!sc || !sc.steps[stepIndex]) return '<option value="">-- Dialogue --</option>';
        var step = sc.steps[stepIndex];
        var lines;
        if (step.branchLines) {
            var pathIndex = I.selectedChoice ? I.selectedChoice.index : 0;
            lines = step.branchLines[pathIndex] || step.branchLines[0] || step.lines;
        } else {
            lines = step.lines;
        }
        if (!lines || lines.length === 0) return '<option value="0">0 (n/a)</option>';
        var html = '<option value="">-- Dialogue --</option>';
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            var preview = (l.speaker || "?") + ': ' + (l.text || "").substring(0, 40) + (l.text && l.text.length > 40 ? "…" : "");
            html += '<option value="' + i + '">' + i + '. ' + preview + '</option>';
        }
        return html;
    }

    /* ── Jump actions ── */

    function jumpToScenario(id) {
        if (!id) return;
        // Force unlock for testing
        if (I.state.unlocked.indexOf(id) === -1) I.state.unlocked.push(id);
        window.LakuLearnRender.openLearnModal();
        window.LakuLearnScenario.startScenario(id, 0, true);
        updateDropdowns();
    }

    function jumpToStep(index) {
        if (index === "" || index === undefined) return;
        index = parseInt(index, 10);
        if (isNaN(index)) return;
        window.LakuLearnScenario.goStep(index);
        updateDropdowns();
    }

    function jumpToDialogue(index) {
        if (index === "" || index === undefined) return;
        index = parseInt(index, 10);
        if (isNaN(index)) return;
        I.currentDialogueIndex = index;
        window.LakuLearnRender.renderStep();
        updateDropdowns();
    }

    /* ── Sync dropdowns with current state ── */

    function updateDropdowns() {
        if (!panel) return;
        var selSc = panel.querySelector("#dbg-scenario");
        var selStep = panel.querySelector("#dbg-step");
        var selDlg = panel.querySelector("#dbg-dialogue");
        var infoDiv = panel.querySelector("#dbg-info");

        if (selSc) selSc.value = I.currentScenarioId || "";
        if (selStep) {
            selStep.innerHTML = stepOptions(I.currentScenarioId);
            selStep.value = I.currentStepIndex;
        }
        if (selDlg) {
            selDlg.innerHTML = dialogueOptions(I.currentScenarioId, I.currentStepIndex);
            selDlg.value = I.currentDialogueIndex;
        }
        if (infoDiv) {
            infoDiv.textContent =
                "scenario: " + (I.currentScenarioId || "-") +
                " | step: " + I.currentStepIndex +
                " | dlg: " + I.currentDialogueIndex +
                " | choice: " + (I.selectedChoice ? JSON.stringify(I.selectedChoice) : "null");
        }
    }

    /* ── Reset ── */

    function resetLearnData() {
        if (confirm("Hapus semua data learn (localStorage + sessionStorage)?")) {
            localStorage.removeItem("laku_learn_state");
            localStorage.removeItem("laku_learn_intro_done");
            localStorage.removeItem("laku_learn_return");
            sessionStorage.removeItem("laku_learn_session");
            location.reload();
        }
    }

    /* ── Build panel HTML ── */

    function buildPanel() {
        var el = document.createElement("div");
        el.id = "learnDebugPanel";
        el.innerHTML =
            '<div style="margin-bottom:6px;font-weight:700;font-size:13px;">' + window.LakuLearnIcons.svg("bug", "1.1em") + ' Learn Debug</div>' +
            '<div style="display:flex;flex-direction:column;gap:4px;">' +
            '  <select id="dbg-scenario" style="padding:4px;font-size:12px;">' + scenarioOptions() + '</select>' +
            '  <select id="dbg-step" style="padding:4px;font-size:12px;">' + stepOptions("") + '</select>' +
            '  <select id="dbg-dialogue" style="padding:4px;font-size:12px;">' + dialogueOptions("", 0) + '</select>' +
            '</div>' +
            '<div id="dbg-info" style="margin-top:6px;font-size:11px;color:#888;word-break:break-all;"></div>' +
            '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">' +
            '  <button id="dbg-go" style="padding:4px 10px;font-size:12px;">Go</button>' +
            '  <button id="dbg-unlock" style="padding:4px 10px;font-size:12px;">Unlock All</button>' +
            '  <button id="dbg-complete" style="padding:4px 10px;font-size:12px;">Complete All</button>' +
            '  <button id="dbg-reset" style="padding:4px 10px;font-size:12px;">Reset Data</button>' +
            '</div>';
        return el;
    }

    /* ── Toggle panel ── */

    function toggle() {
        if (visible && panel) {
            panel.style.display = "none";
            visible = false;
            return;
        }
        if (!panel) {
            panel = buildPanel();
            panel.style.cssText = "position:fixed;bottom:12px;left:12px;z-index:99999;background:#1a1a1a;color:#e0e0e0;padding:10px;border-radius:8px;font-family:monospace;min-width:260px;max-width:340px;box-shadow:0 2px 12px rgba(0,0,0,.4);display:block;";
            document.body.appendChild(panel);

            // Wire events
            var selSc = panel.querySelector("#dbg-scenario");
            var selStep = panel.querySelector("#dbg-step");
            var selDlg = panel.querySelector("#dbg-dialogue");

            selSc.addEventListener("change", function () {
                selStep.innerHTML = stepOptions(selSc.value);
                selDlg.innerHTML = dialogueOptions(selSc.value, 0);
                jumpToScenario(selSc.value);
            });

            selStep.addEventListener("change", function () {
                selDlg.innerHTML = dialogueOptions(selSc.value, parseInt(selStep.value, 10) || 0);
                jumpToStep(selStep.value);
            });

            selDlg.addEventListener("change", function () {
                jumpToDialogue(selDlg.value);
            });

            panel.querySelector("#dbg-go").addEventListener("click", function () {
                var scId = selSc.value;
                var stepIdx = parseInt(selStep.value, 10);
                var dlgIdx = parseInt(selDlg.value, 10);
                if (scId) {
                    jumpToScenario(scId);
                    if (!isNaN(stepIdx) && selStep.value !== "") {
                        jumpToStep(stepIdx);
                        if (!isNaN(dlgIdx) && selDlg.value !== "") {
                            jumpToDialogue(dlgIdx);
                        }
                    }
                }
            });

            panel.querySelector("#dbg-unlock").addEventListener("click", function () {
                var order = D.SCENARIO_ORDER || [];
                for (var i = 0; i < order.length; i++) {
                    if (I.state.unlocked.indexOf(order[i]) === -1) I.state.unlocked.push(order[i]);
                }
                window.LakuLearnState.saveState();
                alert("Semua skenario di-unlock!");
                window.LakuLearnRender.renderPage();
            });

            panel.querySelector("#dbg-complete").addEventListener("click", function () {
                var order = D.SCENARIO_ORDER || [];
                for (var i = 0; i < order.length; i++) {
                    var rec = window.LakuLearnScenario.getScenarioRecord(order[i]);
                    rec.completed = true;
                    if (I.state.unlocked.indexOf(order[i]) === -1) I.state.unlocked.push(order[i]);
                }
                window.LakuLearnState.saveState();
                alert("Semua skenario di-complete!");
                window.LakuLearnRender.renderPage();
            });

            panel.querySelector("#dbg-reset").addEventListener("click", resetLearnData);
        }

        panel.style.display = "block";
        visible = true;
        updateDropdowns();
    }

    /* ── Toggle button ── */

    function createToggleButton() {
        var btn = document.createElement("button");
        btn.id = "learnDebugToggle";
        btn.innerHTML = window.LakuLearnIcons.svg("bug", "1.1em");
        btn.title = "Toggle Learn Debug Panel (Ctrl+Shift+D)";
        btn.style.cssText = "position:fixed;bottom:12px;left:12px;z-index:99998;width:40px;height:40px;border-radius:50%;border:2px solid #333;background:#1a1a1a;color:#e0e0e0;font-size:18px;cursor:pointer;line-height:1;";
        btn.addEventListener("click", toggle);
        document.body.appendChild(btn);
    }

    /* ── Keyboard shortcut ── */

    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === "D") {
            e.preventDefault();
            toggle();
        }
    });

    /* ── Init on DOMContentLoaded ── */

    document.addEventListener("DOMContentLoaded", function () {
        createToggleButton();
    });

    /* ── Auto-sync on state changes (poll every 500ms when panel open) ── */

    setInterval(function () {
        if (visible && panel) updateDropdowns();
    }, 500);

    /* ── Public API ── */

    window.LakuLearnDebug = {
        toggle: toggle,
        updateDropdowns: updateDropdowns
    };
})();
