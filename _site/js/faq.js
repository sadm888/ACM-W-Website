const faq = [
  {
    id: 1,
    question: "Who Are We",
    answer: "ACM-W NITK is a student group that solely focuses on conducting events are programmes for women in NITK and beyond."
  },
  {
    id: 2,
    question: "How Do I Get Involved",
    answer: "ACM-W events are open to all women of NITK, irrespective of clubs, branches, years etc. However, membership in ACM-W is currently restricted only to members of ACM-NITK."
  },
  {
    id: 3,
    question: "What Are The Benefits Of Being In ACM-W",
    answer: "ACM-W promotes a wide range of activities that are often meant to increase exposure to more information by holding sessions with industry professionals, inter-college events, senior-junior interactions and much more. Being a member of ACM-W also allows you to organise such events, polish your leadership skills and build your network. Other benefits include - sponsored travel to GHCI, GHC scholarships, ACM digital library access and much more."
  }
];

function FaqItem(item) {
  return `
    <div class="faq-item">
      <button type="button" class="accordion">${item.question}</button>
      <div class="accordion-content">
        <p>${item.answer}</p>
      </div>
    </div>
  `;
}

document.getElementById("app1").innerHTML = faq.map(FaqItem).join("");

var accordions = document.getElementsByClassName("accordion");
for (var i = 0; i < accordions.length; i++) {
  accordions[i].onclick = function () {
    this.classList.toggle("is-open");
    var content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  };
}
