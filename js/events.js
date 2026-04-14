// ── Events data — loaded from localStorage, seeded from defaults on first visit ──

const EV_KEY = "acmw_events";
const EV_VER = "v1";

const DEFAULT_EVENTS = [
  {
    id: 4,
    name: "Talk with Anubha Maneshwar",
    desc: "We hosted Anubha Maneshwar (founding director of GirlScript) live on our Instagram handle! Viewers learnt about GirlScript Foundation; the inception, journey, her motivation, roadblocks and where Anubha wants to take it in the future. She also shared her opinions on the 'women in tech' movement, entrepreneurship and our education system. The 'Question and Answer' session saw questions on technology, entrepreneurship, profile building, resume writing, community building, professional communication and leadership to which Anubha gave her take on and provided insightful answers.",
    photo: "images/anubha.jpeg",
    type: "past"
  },
  {
    id: 3,
    name: "RecHERsion 2020",
    desc: "Hello there, women of technology! There is no gate, no lock, no bolt. Here's an opportunity for you to follow in the footsteps of greats such as Margaret Hamilton and Grace Mary Hopper. ACM-W, NITK in collaboration with ACM-W, VIT sponsored by Coding Blocks present to you an opportunity to code, compete and show us what you got at an all girls coding contest, RecHERsion.",
    photo: "images/rechersion.jpg",
    type: "past"
  },
  {
    id: 2,
    name: "Women Emerging in Finance 2019",
    desc: "ACM-W presents Women Emerging in Finance 2019, an informal networking opportunity for girls across all years, branches and programs in NITK to interact with women leaders of the firm with the goal of identifying talented women, giving deep insight into the world of finance and creating awareness about the plethora of opportunities at the company.",
    photo: "images/gs.jpg",
    type: "past"
  },
  {
    id: 1,
    name: "Open Source Kick Start",
    desc: "With Hactoberfest 2020 going on in full swing, we at ACM-W invite all open source enthusiasts to contribute to our organisation and watch your work being deployed! Come and get a feel of how most GSoC organisations work and familiarise yourself with Open Source projects.",
    photo: "images/open.jpg",
    type: "past"
  }
];

// Load from localStorage or seed defaults
let allEvents;
const _evStored    = localStorage.getItem(EV_KEY);
const _evStoredVer = localStorage.getItem(EV_KEY + "_ver");
if (_evStored && _evStoredVer === EV_VER) {
  allEvents = JSON.parse(_evStored);
} else {
  allEvents = JSON.parse(JSON.stringify(DEFAULT_EVENTS));
  localStorage.setItem(EV_KEY, JSON.stringify(allEvents));
  localStorage.setItem(EV_KEY + "_ver", EV_VER);
}

// Photo paths are stored as "images/..." relative to _site root.
// events.html lives at html/events.html, so file paths need "../" prefix.
// Base64 data URLs are used as-is.
function imgSrc(photo) {
  return photo.startsWith("data:") ? photo : "../" + photo;
}

const oldeventsData = allEvents.filter(e => e.type === "past");
const neweventsData = allEvents.filter(e => e.type === "upcoming");

function EventTemplate(event) {
  return `
    <div class="event-card">
      <img src="${imgSrc(event.photo)}" alt="${event.name}" class="event-card-img" onerror="this.style.display='none'">
      <div class="event-card-body">
        <h5 class="event-card-title">${event.name}</h5>
        <p class="event-card-text">${event.desc}</p>
      </div>
    </div>
  `;
}

function setActiveTab(activeId, inactiveId) {
  document.getElementById(activeId).classList.add("active");
  document.getElementById(inactiveId).classList.remove("active");
}

function showEvents(data, activeId, inactiveId) {
  document.getElementById("app").innerHTML = data.length === 0
    ? `<div class="events-empty"><i class="fa-solid fa-calendar-xmark"></i>No upcoming events at the moment — check back soon!</div>`
    : data.map(EventTemplate).join("");
  setActiveTab(activeId, inactiveId);
}

function oldevents() {
  showEvents(oldeventsData, "oldevents", "newevents");
}

function newevents() {
  showEvents(neweventsData, "newevents", "oldevents");
}

document.getElementById("oldevents").click();
