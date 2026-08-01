// ================================
// Romantic Website Script
// ================================

// Elements
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");

const yesBtn = document.getElementById("yesBtn");
const thinkBtn = document.getElementById("thinkBtn");

// ================================
// YES Button
// ================================

yesBtn.addEventListener("click", () => {

    popup.style.display = "flex";

    popupText.innerHTML = `
        ❤️ Thank you for saying YES! ❤️<br><br>
        You just made me the happiest person.<br>
        I promise to cherish, respect, support and love you.<br><br>
        This is the beginning of our beautiful journey together. 🌹
    `;

    createConfetti();

});

// ================================
// THINK Button
// ================================

thinkBtn.addEventListener("click", () => {

    popup.style.display = "flex";

    popupText.innerHTML = `
        😊 That's perfectly okay.<br><br>
        Take all the time you need.<br>
        No matter what, I appreciate you and respect your decision. ❤️
    `;

});

// ================================
// Close Popup
// ================================

function closePopup(){

    popup.style.display = "none";

}

// Make function global
window.closePopup = closePopup;


// ================================
// Floating Hearts Generator
// ================================

const heartsContainer = document.querySelector(".hearts");

setInterval(() => {

    const heart = document.createElement("span");

    heart.innerHTML = "❤";

    heart.style.position = "absolute";
    heart.style.left = Math.random() * 100 + "%";
    heart.style.bottom = "-40px";

    heart.style.fontSize =
        (15 + Math.random() * 25) + "px";

    heart.style.opacity =
        Math.random();

    heart.style.animation =
        `heartFloat ${6 + Math.random()*5}s linear forwards`;

    heartsContainer.appendChild(heart);

    setTimeout(() => {

        heart.remove();

    },11000);

},600);


// Floating Animation

const style = document.createElement("style");

style.innerHTML = `

@keyframes heartFloat{

0%{

transform:translateY(0) scale(.5);
opacity:0;

}

10%{

opacity:1;

}

100%{

transform:translateY(-120vh) scale(1.5);
opacity:0;

}

}

`;

document.head.appendChild(style);


// ================================
// Fade In On Scroll
// ================================

const sections = document.querySelectorAll(".section");

const observer = new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.animate([

{
opacity:0,
transform:"translateY(60px)"
},

{
opacity:1,
transform:"translateY(0)"
}

],{

duration:900,
fill:"forwards"

});

}

});

},{threshold:.2});

sections.forEach(section=>{

section.style.opacity=0;

observer.observe(section);

});


// ================================
// Confetti Hearts
// ================================

function createConfetti(){

    for(let i=0;i<80;i++){

        const confetti=document.createElement("div");

        confetti.innerHTML="❤️";

        confetti.style.position="fixed";
        confetti.style.left=Math.random()*100+"vw";
        confetti.style.top="-50px";

        confetti.style.fontSize=
        (18+Math.random()*18)+"px";

        confetti.style.zIndex="9999";

        confetti.style.transition=
        "transform 4s linear, opacity 4s";

        document.body.appendChild(confetti);

        setTimeout(()=>{

            confetti.style.transform=
            `translateY(${window.innerHeight+150}px)
            rotate(${720*Math.random()}deg)`;

            confetti.style.opacity=0;

        },100);

        setTimeout(()=>{

            confetti.remove();

        },4200);

    }

}


// ================================
// Greeting Based On Time
// ================================

const heroTitle =
document.querySelector(".hero-content h3");

const hour = new Date().getHours();

if(hour < 12){

heroTitle.innerHTML =
"Good Morning, Beautiful ❤️";

}
else if(hour < 17){

heroTitle.innerHTML =
"Good Afternoon, Beautiful ❤️";

}
else{

heroTitle.innerHTML =
"Good Evening, Beautiful ❤️";

}


// ================================
// Smooth Button Hover
// ================================

document.querySelectorAll("button").forEach(btn=>{

btn.addEventListener("mouseenter",()=>{

btn.style.transform="scale(1.08)";

});

btn.addEventListener("mouseleave",()=>{

btn.style.transform="scale(1)";

});

});


// ================================
// Console Message ❤️
// ================================

console.log(`
❤️
Made with love.
I hope this becomes a beautiful memory.
❤️
`);
