/**
 * learnDOM.js — DOM manipulation primitives for the Learn module
 *
 * Handles DOM caching, Bu Siti mood/expression, bubble chat with typing animation,
 * and HTML escaping. No rendering logic — that lives in learnRender.js.
 *
 * Dependencies: LakuLearnData (MOOD_LABELS, getScenario)
 * Exports: window.LakuLearnDOM
 */
(function () {
    "use strict";
    var D = window.LakuLearnData;
    var I = window.LakuLearnInternal = window.LakuLearnInternal || {};

    I.dom = {};
    I.typingTimer = null;

    /* ── Utilities ── */

    function escapeHtml(value) {
        return String(value === null || value === undefined ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    /* ── DOM Caching ── */

    function cacheDOM() {
        I.dom.overlay = document.getElementById("learnModalOverlay");
        I.dom.contentArea = document.getElementById("learnModalContent");
        I.dom.stage = document.getElementById("learnStage");
        I.dom.sitiFigure = document.getElementById("learnSitiFigure");
        I.dom.sitiImage = document.getElementById("learnSitiImage");
        I.dom.sitiSvgObj = document.getElementById("learnSitiObject");
        I.dom.moodLabel = document.getElementById("learnMood");
        I.dom.speaker = document.getElementById("learnSpeaker");
        I.dom.bubble = document.getElementById("learnBubbleChat");
        I.dom.bubbleText = document.getElementById("learnBubbleText");
        I.dom.modalTitle = document.getElementById("learnModalTitle");
        I.dom.modalIcon = document.getElementById("learnModalIcon");
        I.dom.modalProgress = document.getElementById("learnModalProgress");
        I.dom.modalStep = document.getElementById("learnModalStep");
        I.dom.modalXp = document.getElementById("learnModalXp");
        I.dom.modalFooter = document.getElementById("learnModalFooter");
        I.dom.heroProgress = document.getElementById("learnHeroProgress");
        I.dom.heroXp = document.getElementById("learnHeroXp");
        I.dom.heroLevel = document.getElementById("learnHeroLevel");
        I.dom.heroStreak = document.getElementById("learnHeroStreak");
        I.dom.path = document.getElementById("learnScenarioPath");
        I.dom.badges = document.getElementById("learnBadgeGallery");
        I.dom.warung = document.getElementById("learnWarungVisual");
        I.dom.warungLabel = document.getElementById("learnWarungLabel");
        I.dom.checklist = document.getElementById("learnChecklist");
        I.dom.checklistSummary = document.getElementById("learnChecklistSummary");
    }

    /* ── Mood & Expression ── */

    function setMood(mood) {
        var value = D.MOOD_LABELS[mood] ? mood : "neutral";
        if (I.dom.stage) I.dom.stage.setAttribute("data-mood", value);
        if (I.dom.sitiImage) {
            I.dom.sitiImage.classList.remove("siti-wave", "siti-bounce", "siti-shake");
            void I.dom.sitiImage.offsetWidth;
            if (value === "happy" || value === "proud") I.dom.sitiImage.classList.add("siti-bounce");
            if (value === "worried") I.dom.sitiImage.classList.add("siti-shake");
        }
        if (I.dom.moodLabel) {
            var ICONS = window.LakuLearnIcons;
            I.dom.moodLabel.innerHTML = ICONS.svg("happy", "1em") + " " + D.MOOD_LABELS[value];
        }
        // SVG character mood updates
        var svg = document.getElementById("buSitiSvg");
        if (svg) {
            svg.classList.remove("mouth-happy", "mouth-worried", "mouth-thinking", "mouth-surprised", "mouth-proud");
            if (value === "happy" || value === "relieved") svg.classList.add("mouth-happy");
            else if (value === "worried") svg.classList.add("mouth-worried");
            else if (value === "thinking") svg.classList.add("mouth-thinking");
            else if (value === "surprised") svg.classList.add("mouth-surprised");
            else if (value === "proud") svg.classList.add("mouth-proud");
            var leftArm = svg.querySelector(".siti-left-arm");
            var rightArm = svg.querySelector(".siti-right-arm");
            var head = svg.querySelector(".siti-head");
            if (leftArm) leftArm.classList.remove("waving");
            if (rightArm) rightArm.classList.remove("cooking");
            if (head) head.classList.remove("tilted");
            void svg.offsetWidth;
            if (value === "happy" || value === "proud" || value === "relieved") {
                if (leftArm) leftArm.classList.add("waving");
                if (rightArm) rightArm.classList.add("cooking");
            } else if (value === "worried") {
                if (head) head.classList.add("tilted");
            } else if (value === "thinking") {
                if (head) head.classList.add("tilted");
            } else {
                if (rightArm) rightArm.classList.add("cooking");
            }
        }
    }

    /* ── Bubble Chat ── */

    function typeBubbleText(text, callback) {
        if (!I.dom.bubbleText) { if (callback) callback(); return; }
        if (I.typingTimer) { clearTimeout(I.typingTimer); I.typingTimer = null; }
        I.dom.bubbleText.textContent = "";
        I.dom.bubbleText.classList.add("typing-active");
        var i = 0;
        var speed = 28;
        function typeChar() {
            if (i < text.length) {
                I.dom.bubbleText.textContent += text.charAt(i);
                i++;
                I.typingTimer = setTimeout(typeChar, speed);
            } else {
                I.dom.bubbleText.classList.remove("typing-active");
                I.typingTimer = null;
                if (callback) callback();
            }
        }
        typeChar();
    }

    function skipTyping() {
        if (!I.typingTimer) return;
        clearTimeout(I.typingTimer);
        I.typingTimer = null;
        if (I.dom.bubbleText) {
            var fullText = I.dom.bubbleText.getAttribute("data-full-text") || "";
            if (fullText) I.dom.bubbleText.textContent = fullText;
            I.dom.bubbleText.classList.remove("typing-active");
        }
    }

    function showBubble(speaker, text, mood) {
        if (!I.dom.bubble || !I.dom.bubbleText) return;
        if (I.dom.speaker) I.dom.speaker.textContent = speaker || "Bu Siti";
        I.dom.bubbleText.setAttribute("data-full-text", text);
        I.dom.bubble.classList.remove("hidden");
        I.dom.bubble.classList.remove("bubble-pop");
        void I.dom.bubble.offsetWidth;
        I.dom.bubble.classList.add("bubble-pop");
        setMood(mood);
        typeBubbleText(text);
    }

    function hideBubble() {
        if (I.dom.bubble) I.dom.bubble.classList.add("hidden");
    }

    /* ── Step Data Accessor ── */

    function getCurrentStepData() {
        var scenario = D.getScenario(I.currentScenarioId);
        if (!scenario) return null;
        var stepIndex = I.currentStepIndex;
        if (stepIndex < 0 || stepIndex >= scenario.steps.length) return null;
        return {
            scenario: scenario,
            step: scenario.steps[stepIndex],
            stepIndex: stepIndex,
            dialogueIndex: I.currentDialogueIndex
        };
    }

    window.LakuLearnDOM = {
        cacheDOM: cacheDOM,
        setMood: setMood,
        typeBubbleText: typeBubbleText,
        skipTyping: skipTyping,
        showBubble: showBubble,
        hideBubble: hideBubble,
        escapeHtml: escapeHtml,
        getCurrentStepData: getCurrentStepData
    };
})();
