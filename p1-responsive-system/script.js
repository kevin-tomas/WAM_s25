const totalImages = 38;
const imageContainer = document.getElementById('image-container-open');
let images = [];

for (let i = 0; i < totalImages; i++) {
    let img = document.createElement('img');
    img.src = `images/image${i + 1}.jpg`; 
    img.dataset.index = i; 
    images.push(img);
    imageContainer.appendChild(img);
}

let currentIndex = 0;

function updateContent() {

    const scrollPercentage = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const scaledScrollPercentage = Math.min(scrollPercentage * (1 / 0.75), 1); 


    const newIndex = Math.floor(scrollPercentage * (totalImages - 1));
    if (newIndex !== currentIndex) {

        images[currentIndex].classList.remove('active');
        

        currentIndex = newIndex;
        images[currentIndex].classList.add('active');
    }
    

    const words = document.querySelectorAll('#poem-text-open span');
    const totalWords = words.length;
    const wordIndex = Math.floor(scaledScrollPercentage * totalWords);


    words.forEach((word, index) => {
        if (index <= wordIndex) {
            word.style.opacity = 1;
        } else {
            word.style.opacity = 0;
        }
    });


    updateNavigationText(scrollPercentage);
}


function updateNavigationText(scrollPercentage) {
    const navigation = document.getElementById('navigation-open');
    const scrollPosition = window.scrollY + window.innerHeight; 
    const documentHeight = document.documentElement.scrollHeight;


    if (scrollPosition >= documentHeight) {
        navigation.innerHTML = 'Resize Window from Right';
    } else {
        navigation.innerHTML = 'Scroll';
    }
}


const poemText = document.getElementById('poem-text-open');
const words = poemText.innerText.split(' ').map(word => `<span>${word}</span>`).join(' ');
poemText.innerHTML = words;


images[currentIndex].classList.add('active');


window.addEventListener('scroll', updateContent);


window.addEventListener('resize', () => updateNavigationText(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)));


updateNavigationText(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight));
