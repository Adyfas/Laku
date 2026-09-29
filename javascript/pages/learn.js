(function () {
    "use strict";
    window.LakuLearnInternal = window.LakuLearnInternal || {};
    var I = window.LakuLearnInternal;

    I.state = window.LakuLearnState.loadState();

    I.currentScenarioId = I.currentScenarioId || null;
    I.currentStepIndex = I.currentStepIndex || 0;
    I.currentDialogueIndex = I.currentDialogueIndex || 0;
    I.selectedChoice = I.selectedChoice || null;
    I.choiceAttempts = I.choiceAttempts || 0;
    I.modalOpen = I.modalOpen || false;
    I.dom = I.dom || {};
    I.typingTimer = I.typingTimer || null;

    var Render = window.LakuLearnRender;
    var Scenario = window.LakuLearnScenario;
    var Actions = window.LakuLearnActions;
    var DOM = window.LakuLearnDOM;
    var Data = window.LakuLearnData;

    window.LakuLearn = {
        open: Render.openLearnModal,
        close: Render.closeLearnModal,
        startJourney: Render.startJourney,

        nextStep: Scenario.nextStep,
        nextDialogue: Scenario.nextDialogue,
        goBack: Scenario.goBack,
        makeChoice: Scenario.chooseOption,
        chooseOption: Scenario.chooseOption,
        retryChoice: Scenario.retryChoice,
        revealChoice: Scenario.revealChoice,
        goToScenario: Scenario.goToScenario,

        openScenario: Actions.openScenario,
        refreshAction: Actions.refreshAction,
        completeAction: Actions.completeAction,
        toggleChecklist: Actions.toggleChecklist,
        resetProgress: Actions.resetProgress,

        skipTyping: DOM.skipTyping,

        getState: function () { return I.state; },
        SCENARIOS: Data.SCENARIOS
    };

    document.addEventListener("DOMContentLoaded", function () {
        DOM.cacheDOM();
        Render.renderPage();
        Actions.maybeOpenFromQuery();
        var bubbleCard = document.getElementById("learnBubbleChat");
        if (bubbleCard) {
            bubbleCard.addEventListener("click", function () {
                DOM.skipTyping();
            });
        }
    });
})();

const listLearn = [
    {
        title: "Memisahkan uang usaha dan uang pribadi",
        icon: "walletv2"
    },
    {
        title: "Mencatat transaksi harian",
        icon: "book"
    },
    {
        title: "Memahami pemasukan, pengeluaran, dan keuntungan",
        icon: "flag"
    },
]


// render list

const sectionLearnList = document.getElementById('listLearn')


// render 
const sectionLearnMapping = listLearn.map((item, index) => `
<li class="flex items-center my-2 gap-2 fade-in"  data-once="true"
            data-delay="0.2" data-duration="${0.8 * index+1}" data-direction="up">          
        <div class="p-2 w-10 h-10 text-center bg-lime-main mx-2 rounded-full">
        ${window.LakuIcons.svg(item.icon)}
        </div>
        <p>
            ${item.title}
        </p>
</li>
`).join('')


sectionLearnList.innerHTML = sectionLearnMapping;
