const tabs = document.querySelectorAll('[data-tab-target]')
const tabContents = document.querySelectorAll('[data-tab-content]')

tabs.forEach(tab =>{
    tab.addEventListener('click',() =>{
        const target = document.querySelector(tab.dataset.tabTarget)
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active')
        
    })
    tabs.forEach(tab => {
            tab.classList.remove('active')
        
    })
    tab.classList.add('active')
    target.classList.add('active')
    })

})


// Function to create multiple stars
function createStars() {
  const numberOfStars = 300; // Adjust for more or fewer stars
  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    // Random size, position, and animation duration for each star
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 99}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDuration = `${Math.random() * 2 + 1}s`;

    document.body.appendChild(star);
  }
}

createStars();



  