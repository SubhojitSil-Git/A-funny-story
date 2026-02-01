// CONFIGURATION
const TYPE_SPEED = 28; 
const BLOCK_DELAY = 500; 

// GAME STATE
const state = {
    saviorScore: 0,   
    silenceScore: 0,  
    connection: 0,    
};

// DOM REFERENCES
const storyLog = document.getElementById('story-log');
const choiceArea = document.getElementById('choices');
const scrollContainer = document.getElementById('scroll-container');
const chapterIndicator = document.getElementById('chapter-indicator');
const typingIndicator = document.getElementById('typing-indicator');

// ENGINE FUNCTIONS

// 1. Typewriter Effect
function typeText(element, text, callback) {
    let index = 0;
    
    function nextChar() {
        if (index < text.length) {
            // Handle HTML tags
            if (text[index] === '<') {
                const closeIdx = text.indexOf('>', index);
                element.innerHTML += text.substring(index, closeIdx + 1);
                index = closeIdx + 1;
            } else {
                element.innerHTML += text[index];
                index++;
            }
            
            // Auto scroll
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
            
            // Randomize speed slightly for realism
            const randomSpeed = TYPE_SPEED + (Math.random() * 10 - 5);
            setTimeout(nextChar, randomSpeed);
        } else {
            if (callback) callback();
        }
    }
    nextChar();
}

// 2. Render a Block of Text
async function renderBlock(text, isDialogue = false, isYou = false) {
    return new Promise(resolve => {
        const div = document.createElement('div');
        div.className = "story-block story-text";
        if (isDialogue) div.classList.add("speaker-him");
        if (isYou) div.classList.add("speaker-you");
        
        storyLog.appendChild(div);
        
        if(isDialogue) typingIndicator.classList.remove('hidden');

        setTimeout(() => {
            typeText(div, text, () => {
                typingIndicator.classList.add('hidden');
                setTimeout(resolve, BLOCK_DELAY);
            });
        }, 200);
    });
}

// 3. Choice System
function clearChoices() {
    choiceArea.innerHTML = '';
}

function showChoices(choices) {
    clearChoices();
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = "choice-btn";
        btn.innerHTML = choice.text; 
        
        btn.onclick = () => {
            const allBtns = document.querySelectorAll('.choice-btn');
            allBtns.forEach(b => b.disabled = true);
            
            btn.style.borderColor = "#0d9488"; 
            btn.style.backgroundColor = "rgba(13, 148, 136, 0.1)";
            btn.style.color = "#fff";

            if (choice.effect) choice.effect();
            
            renderBlock(choice.text.replace(/(<([^>]+)>)/gi, ""), false, true).then(() => {
                 handleScene(choice.next);
            });
        };
        choiceArea.appendChild(btn);
    });
}

// STORY CONTENT

const scenes = {
    start: {
        chapter: "LAYER 1",
        run: async () => {
            await renderBlock("You meet him after the fight is over.");
            await renderBlock("Not the dramatic fight the internal one.");
            await renderBlock("He isn’t deciding whether to live. He already decided not to die today, and that effort exhausted him.");
            await renderBlock("“I don’t feel sad,” he says. “I feel… administratively alive.”", true);
            await renderBlock("That sentence should tell you everything.");
            await renderBlock("He has survived therapy, outlasted concern, and learned the correct vocabulary for pain.");
            await renderBlock("This is not a boy asking for help. This is a boy tolerating time.");
            
            showChoices([
                { text: "Ask what 'administratively alive' means.", next: "layer1_ask", effect: () => state.saviorScore++ },
                { text: "Sit beside him and say nothing.", next: "layer1_sit", effect: () => state.connection++ },
                { text: "Tell him that sounds exhausting.", next: "layer1_validate", effect: () => state.connection++ }
            ]);
        }
    },

    layer1_ask: {
        run: async () => {
            await renderBlock("“It means I’m filling out the forms,” he replies. “Eating. Sleeping. Breathing. Checking the boxes so nobody worries.”", true);
            handleScene('layer2_transition');
        }
    },
    layer1_sit: {
        run: async () => {
            await renderBlock("He shifts slightly. He isn't used to silence that doesn't demand an answer.");
            await renderBlock("“You don't have to stay,” he mumbles.", true);
            handleScene('layer2_transition');
        }
    },
    layer1_validate: {
        run: async () => {
            await renderBlock("He lets out a breath that sounds like a laugh.");
            await renderBlock("“It is,” he says. “It's a full time job.”", true);
            handleScene('layer2_transition');
        }
    },

    layer2_transition: {
        chapter: "LAYER 2",
        run: async () => {
            await renderBlock("You step inside his remaining margin.");
            await renderBlock("LAYER 2 THE ATTACHMENT FORMS");
            await renderBlock("No matter how you speak to him gently, honestly, carefully, distantly one thing happens:");
            await renderBlock("He starts waiting. Not for solutions. For you.");
            await renderBlock("Weeks pass. You notice he stays online longer. He explains himself more.");
            
            showChoices([
                { text: "Reply instantly whenever he messages.", next: "layer2_active", effect: () => state.saviorScore++ },
                { text: "Reply only when you have energy.", next: "layer2_passive", effect: () => state.silenceScore++ },
                { text: "Tell him you enjoy his company.", next: "layer2_friend", effect: () => state.connection++ }
            ]);
        }
    },

    layer2_active: {
        run: async () => {
            await renderBlock("You feel useful. You are becoming the reason he postpones an ending he has already accepted.");
            handleScene('layer3_transition');
        }
    },
    layer2_passive: {
        run: async () => {
            await renderBlock("He apologizes for bothering you. He pulls back, but he doesn't leave.");
            handleScene('layer3_transition');
        }
    },
    layer2_friend: {
        run: async () => {
            await renderBlock("He seems surprised. He's not used to being a person, only a problem.");
            handleScene('layer3_transition');
        }
    },

    layer3_transition: {
        chapter: "LAYER 3",
        run: async () => {
            await renderBlock("LAYER 3 THE ILLUSION OF PROGRESS");
            await renderBlock("This is the layer that tricks both of you.");
            await renderBlock("He starts sounding “better.” He jokes. He makes small plans.");
            await renderBlock("“I bought a plant today,” he messages you.", true);
            
            showChoices([
                { text: "“That’s amazing! I’m so proud of you.”", next: "layer3_praise", effect: () => state.saviorScore += 2 },
                { text: "“What kind of plant?”", next: "layer3_curious", effect: () => state.connection++ },
                { text: "“Cool.”", next: "layer3_dismiss", effect: () => state.silenceScore++ }
            ]);
        }
    },

    layer3_praise: {
        run: async () => {
            await renderBlock("He sends a smiley face.");
            await renderBlock("You feel relief. What you don’t see is that depression, at this stage, doesn’t collapse. It organizes.");
            await renderBlock("He isn't improving because of the plant. He's performing improvement for you.");
            handleScene('layer4_transition');
        }
    },
    layer3_curious: {
        run: async () => {
            await renderBlock("“A succulent,” he says. “Hard to kill. Like me.”", true);
            handleScene('layer4_transition');
        }
    },
    layer3_dismiss: {
        run: async () => {
            await renderBlock("He stops typing for a long time.");
            handleScene('layer4_transition');
        }
    },

    layer4_transition: {
        chapter: "LAYER 4",
        run: async () => {
            await renderBlock("LAYER 4 THE QUESTION");
            await renderBlock("Time passes. The plant dies. He doesn't mention it.");
            await renderBlock("One night, at 3:00 AM, the text comes.");
            await renderBlock("“Do you think a person can become harmful just by staying?”", true);
            await renderBlock("This is not a philosophical question. It is a confession disguised as ethics.");

            showChoices([
                { text: "“No, of course not.”", next: "layer4_no", effect: () => state.saviorScore += 2 },
                { text: "“Sometimes. Why do you ask?”", next: "layer4_sometimes", effect: () => state.saviorScore++ },
                { text: "Avoid answering directly.", next: "layer4_avoid", effect: () => state.silenceScore += 2 }
            ]);
        }
    },

    layer4_no: {
        run: async () => {
            await renderBlock("He learns that his perception is unshareable. He stops trying to explain himself.");
            handleScene('layer5_transition');
        }
    },
    layer4_sometimes: {
        run: async () => {
            await renderBlock("He hears justification. He begins evaluating himself as damage.");
            handleScene('layer5_transition');
        }
    },
    layer4_avoid: {
        run: async () => {
            await renderBlock("He concludes the truth is unspeakable.");
            handleScene('layer5_transition');
        }
    },

    layer5_transition: {
        chapter: "LAYER 5",
        run: async () => {
            await renderBlock("LAYER 5 THE MORAL COLLAPSE");
            await renderBlock("This is where the story becomes cruel. Because now he isn’t suffering emotionally. He is suffering ethically.");
            await renderBlock("He tells you:");
            await renderBlock("“If I stay, people worry. If I leave, they grieve. Either way, I cause harm.”", true);
            await renderBlock("You try to argue. But arguments only work when the person believes they deserve to exist. He doesn’t.");
            await renderBlock("Your presence has not made him want to live. It has made him want to die cleanly.");
            
            showChoices([
                { text: "Beg him to stay for you.", next: "layer6_beg", effect: () => state.saviorScore += 3 },
                { text: "Tell him he's wrong.", next: "layer6_argue", effect: () => state.saviorScore += 2 },
                { text: "“I am just here. I am not leaving.”", next: "layer6_witness", effect: () => state.connection += 3 }
            ]);
        }
    },

    layer6_beg: { run: async () => handleScene('layer6_transition') },
    layer6_argue: { run: async () => handleScene('layer6_transition') },
    layer6_witness: { run: async () => handleScene('layer6_transition') },

    layer6_transition: {
        chapter: "LAYER 6",
        run: async () => {
            await renderBlock("LAYER 6 THE FINAL ATTACHMENT");
            await renderBlock("He grows calm. Not numb settled.");
            await renderBlock("He thanks you. Not desperately. Not emotionally. Properly.");
            await renderBlock("“I don’t think I would’ve lasted this long without you,” he says.", true);
            await renderBlock("That sentence will haunt you forever.");
            await renderBlock("Because now you see it: You didn’t save him. You helped him last.");
            
            showChoices([
                { text: "Say goodbye.", next: "layer7_logic" },
                { text: "Ask where he is.", next: "layer7_logic" }
            ]);
        }
    },

    layer7_logic: {
        run: async () => {
            // ENDING CALCULATOR
            
            // 1. GOOD ENDING: Connection is high, didn't try to fix him too much
            if (state.connection >= 4 && state.saviorScore < 5 && state.silenceScore < 3) {
                handleScene('ending_good');
                return;
            } 
            
            // 2. THE WORST ENDING: Savior Score is High
            if (state.saviorScore >= 5) {
                handleScene('ending_worst');
                return;
            }

            // 3. SILENCE ENDING: Silence Score is High
            if (state.silenceScore >= 3) {
                handleScene('ending_silence');
                return;
            }

            // 4. Fallback
            handleScene('ending_gratitude');
        }
    },

    // ENDING SCENES

    ending_worst: {
        chapter: "THE WORST ENDING",
        run: async () => {
            await renderBlock("He feels the weight of your hope. It crushes him.");
            await renderBlock("He realizes he cannot be the person you need him to be.");
            await renderBlock("He breaks. It is not quiet. It is not peaceful.");
            
            await renderBlock("He takes the sharp blade.");
            await renderBlock("He doesn't hesitate.");
            
            await renderBlock("<span class='bleed-text'>He slits his hand open. He cuts deep.</span>");
            await renderBlock("<span class='bleed-text'>He cuts himself to pieces.</span>");
            await renderBlock("<span class='bleed-text'>Blood flows from all over his hand.</span>");
            
            await renderBlock("The room smells of iron.", false);
            await renderBlock("<span class='cold-text'>He is slowly growing cold.</span>");
            await renderBlock("<span class='cold-text'>So cold.</span>");
            
            await renderBlock("You couldn't help. You did what you could. Don't have a regret.");
            await renderBlock("But you will. You validated the logic that killed him.");
            handleScene('final_meta');
        }
    },

    ending_silence: {
        chapter: "THE SILENCE ENDING",
        run: async () => {
            await renderBlock("He takes your silence as permission.");
            await renderBlock("He frames the choice as rational.");
            await renderBlock("He slits his hand open with a sharp blade.", false);
            await renderBlock("Blood flows. He is slowly growing cold.");
            await renderBlock("You couldn't help. You did what you can.");
            await renderBlock("He leaves nothing. No closure. No meaning.");
            await renderBlock("You are left arguing with a void that never answers.");
            handleScene('final_meta');
        }
    },

    ending_gratitude: {
        chapter: "THE GRATITUDE ENDING",
        run: async () => {
            await renderBlock("The messages stop.");
            await renderBlock("He didn't want to burden you with the moment.");
            await renderBlock("He slits his hand open quietly.", false);
            await renderBlock("He is slowly growing cold.");
            await renderBlock("He leaves words of thanks.");
            await renderBlock("You are destroyed by the idea that love was present and still insufficient.");
            handleScene('final_meta');
        }
    },

    ending_good: {
        chapter: "THE DELAY ENDING",
        run: async () => {
            await renderBlock("He holds the blade.");
            await renderBlock("He thinks about the logic. He thinks about the peace.");
            await renderBlock("But he remembers you didn't try to fix him.");
            await renderBlock("You just sat there. You witnessed him.");
            await renderBlock("He puts the blade down. Not because he wants to live.");
            await renderBlock("But because he is curious to see if you'll still be there tomorrow.");
            await renderBlock("He messages you: “I’m still here. I don't know why.”", true);
            await renderBlock("It is not a happy ending. It is simply... not an ending.");
            handleScene('final_meta');
        }
    },

    final_meta: {
        run: async () => {
            await renderBlock("<br><br>");
            await renderBlock("The story ends with this realization, addressed to you:");
            await renderBlock("You thought you were choosing how to save him.");
            await renderBlock("You were actually choosing how to survive knowing you couldn’t.");
            await renderBlock("Some people do not need more love. They need a reason that does not depend on anyone else.");
            await renderBlock("And you were never allowed to be that reason.");
            await renderBlock("No replay button. No comfort screen. Just the weight.");
            
            // End State
            clearChoices();
            const endDiv = document.createElement('div');
            endDiv.innerHTML = "FIN";
            endDiv.className = "text-center text-slate-600 tracking-[0.5em] mt-8 font-serif opacity-50";
            choiceArea.appendChild(endDiv);
        }
    }
};

// INITIALIZATION

async function handleScene(sceneKey) {
    if (scenes[sceneKey]) {
        // Update Chapter Header
        if(scenes[sceneKey].chapter) {
            chapterIndicator.innerText = scenes[sceneKey].chapter;
            // Retrigger animation
            chapterIndicator.classList.remove('animate-fade-in-slow');
            void chapterIndicator.offsetWidth; 
            chapterIndicator.classList.add('animate-fade-in-slow');
        }
        
        await scenes[sceneKey].run();
    } else {
        console.error("Missing scene:", sceneKey);
    }
}

// Start Button Listener
document.getElementById('start-btn').onclick = () => {
    handleScene('start');
};