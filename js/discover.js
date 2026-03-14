const search = document.getElementById('searchbar');
const prevbtn = document.getElementById('prevbtn');
const nextbtn = document.getElementById('nextbtn');
const dropdown = document.getElementById('dropdown_menu');

let loaddata = [];
let itemsPerPage = Number(dropdown.value);
let currentPage = 1;
let dataToDisplay = [];

fetch("../opp.json")
    .then(response => response.json())
    .then(json => {
        loaddata = json;
        dataToDisplay = loaddata;
        renderData();
    });

function renderData() {
    itemsPerPage = Number(dropdown.value);
    if (search.value.trim() === '') dataToDisplay = loaddata;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, dataToDisplay.length);
    const dataPerPage = dataToDisplay.slice(startIndex, endIndex);
    const contents = document.getElementById("contents");
    contents.innerHTML = "";

    dataPerPage.forEach(item => {
        const block = document.createElement('div');
        block.classList.add('blocks');
        block.innerHTML =
            `<div class="visible"><h4>${item.name}</h4>`
            + `<h6>${item.organiser}</h6>`
            + `<h5>${item.typeOfEvent}</h5>`
            + `<p>Eligibility: ${item.eligibility}</p></div>`
            + `<div class="popup">`
                + `<div class="popupHeader">`
                    + `<h4>${item.name}</h4>`
                    + `<button class="closePopup">x</button>`
                + `</div>`
                + `<div class="popupBody">`
                    + `<p><span>Organiser:</span> ${item.organiser}</p>`
                    + `<p><span>Type of Event:</span> ${item.typeOfEvent}</p>`
                    + `<p><span>Eligibility:</span> ${item.eligibility}</p>`
                    + `<p><span>Rewards:</span> ${item.awardsPrizesBenefits}</p>`
                    + `<p><span>Application date:</span> ${item.applicationDate}</p>`
                    + `<p><span>Tags:</span> ${item.eventDomainTags}</p>`
                    + `<p><span>Description:</span> ${item.description}</p>`
                    + `<a href="${item.website}">Learn more &gt;&gt;</a>`
                + `</div>`
                + `<div class="overlay"></div>`
            + `</div>`;
        contents.appendChild(block);
    });

    const overlay = document.getElementById('test');
    document.querySelectorAll('.blocks').forEach(block => {
        const vis = block.querySelector('.visible');
        const popup = block.querySelector('.popup');
        const close = block.querySelector('.closePopup');
        let isOpen = false;

        function closePopup() {
            overlay.style.display = 'none';
            popup.style.display = 'none';
            isOpen = false;
        }

        vis.addEventListener('click', () => {
            if (!isOpen) {
                overlay.style.display = 'block';
                popup.style.display = 'block';
                isOpen = true;
            }
        });

        close.addEventListener('click', () => { if (isOpen) closePopup(); });
        overlay.addEventListener('click', () => { if (isOpen) closePopup(); });
    });

    document.getElementById('itemsshowing').innerHTML =
        `Showing ${startIndex + 1} to ${endIndex} of ${dataToDisplay.length} items`;

    prevbtn.hidden = currentPage === 1;
    nextbtn.hidden = currentPage === Math.ceil(dataToDisplay.length / itemsPerPage);
}

function searching() {
    const input = search.value.toLowerCase();
    dataToDisplay = loaddata.filter(item =>
        item.name.toLowerCase().includes(input)
        || item.organiser.toLowerCase().includes(input)
        || item.typeOfEvent.toLowerCase().includes(input)
        || item.awardsPrizesBenefits.toLowerCase().includes(input)
        || item.eventDomainTags.toLowerCase().includes(input)
    );
    currentPage = 1;
    renderData();
}

prevbtn.addEventListener('click', () => {
    document.documentElement.scrollTop = 0;
    currentPage--;
    renderData();
});

nextbtn.addEventListener('click', () => {
    document.documentElement.scrollTop = 0;
    currentPage++;
    renderData();
});

dropdown.addEventListener('change', () => {
    currentPage = 1;
    renderData();
});
