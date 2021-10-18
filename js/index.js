import { WorkerWithPeopleData } from "./class.js";

let workerWithPeopleData = new WorkerWithPeopleData();

// load data about people 
document.addEventListener("DOMContentLoaded", event => {
    workerWithPeopleData.getData();
});

// show data about current person
let tableBody = document.querySelector(".people-table__body");
tableBody.addEventListener("click", event => {
    workerWithPeopleData.printInfoAboutPerson(event.target);
});

// filter by name
let filterByNameField = document.querySelector(".filter-by-name__input");
filterByNameField.addEventListener("input", event => {
    let settingsForFilter = '{"attr":"firstName","value":"' + event.target.value + '"}';
    workerWithPeopleData.filterDataList(settingsForFilter);
});

// filter by state
// open/close filter-by-state menu
let filterbyStateButton = document.querySelector(".filter-by-state__button");
filterbyStateButton.addEventListener("click", event => {
    let filterByStateMenu = document.querySelector(".filter-by-state__menu");
    filterByStateMenu.classList.toggle("none");
});

let filterByStateBlock = document.querySelector(".filter-by-state");
filterByStateBlock.addEventListener("click", event => {
    if (!event.target.classList.contains("filter-by-state__menu-element")) return;
    
    let settingsForFilter = '{"attr":"state","value":"' + event.target.dataset.value + '"}';
    workerWithPeopleData.filterDataList(settingsForFilter);
});

// sort
let tableHeadersRow = document.querySelector(".people-table__headers-row");
tableHeadersRow.addEventListener("click", event => {
    if (event.target.tagName !== "BUTTON") return;
    
    workerWithPeopleData.sort(event.target.dataset.sortKey);
});

// pagination
let paginationButtonsContainer = document.querySelector(".pagination-control");
paginationButtonsContainer.addEventListener("click", event => {
    if (event.target.tagName !== "BUTTON") return;
    let indicator = +document.querySelector(".pagination-control__indicator").textContent;

    workerWithPeopleData.paginate(event.target, indicator);
});

// refresh
let refreshButton = document.querySelector(".refresh__button");
refreshButton.addEventListener("click", event => {
    workerWithPeopleData.refresh();
});