import { generateId } from "./idGenerator.js";

export class WorkerWithPeopleData {
    #peopleDataList = [];
    #dataListToPrint = [];
    #maxNumberForPrint = 20;
    #sortFlags = {
        id: false,
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
        state: false
    };
    #isFilteredOrSorted = false;

    constructor() {
        if (typeof WorkerWithPeopleData.instance === "object") {
            return WorkerWithPeopleData.instance;
        }

        WorkerWithPeopleData.instance = this;
        return WorkerWithPeopleData.instance;
    }

    // to get data
    async getData() {
        // Emulation of API request
        const API_EMUL_URL = "./info/data.json";

        try {
            this.#peopleDataList = await fetch(API_EMUL_URL).then(response => response.json());
        } catch (error) {
            this.#printData([]);
        }

        for (let i = 0; i < this.#peopleDataList.length; i++) {
            let currentData = this.#peopleDataList[i];
            currentData.localId = generateId();
        }

        this.#dataListToPrint = this.#peopleDataList.slice();
        this.#printData(this.#dataListToPrint);
        this.#printStatesList();
    }

    // to print info about person
    printInfoAboutPerson(target) {
        if (target.tagName !== "TD") return;

        let currentRow = target.closest("tr");
        let currentId = currentRow.dataset.localId;

        let currentData = this.#peopleDataList.find(personData => personData.localId === currentId);

        // print data
        let selectedProfile = document.querySelector(".person-info__selected-profile");
        selectedProfile.textContent = `${currentData.firstName} ${currentData.lastName}`;

        let description = document.querySelector(".person-info__description");
        description.textContent = currentData.description;
        
        let address = document.querySelector(".person-info__address");
        address.textContent = currentData.adress.streetAddress; // source data with mistake

        let city = document.querySelector(".person-info__city");
        city.textContent = currentData.adress.city;
        
        let state = document.querySelector(".person-info__state");
        state.textContent = currentData.adress.state;
        
        let index = document.querySelector(".person-info__index");
        index.textContent = currentData.adress.zip;

        let email = document.querySelector(".person-info__email");
        email.textContent = currentData.email;
    }

    // filter data for show
    filterDataList(sourceSettings) {
        let { attr: attributeOfFilter, value: valueForFilter } = JSON.parse(sourceSettings);
        // console.log(attributeOfFilter, valueForFilter);
    
        let filterCallback;

        switch(attributeOfFilter) {
            case "firstName":
                filterCallback = personData => personData[attributeOfFilter].toLowerCase() === valueForFilter.toLowerCase();
                break;
            case "state":
                filterCallback = personData => personData.adress[attributeOfFilter] === valueForFilter;
                break;
        }

        this.#dataListToPrint = this.#peopleDataList.filter(filterCallback);
        
        if (attributeOfFilter === "firstName" && !valueForFilter.length) {
            this.refresh();
        } else {
            this.#printData(this.#dataListToPrint, 0, this.#dataListToPrint.length);
        }
        
        let rows = Array.from(document.querySelectorAll(".people-table__row"));
        if (rows.length < 21) this.#setPaginationControlToDisable();
        this.#isFilteredOrSorted = true;
        this.#setFilterByStateMenuToDefault();
        if (attributeOfFilter === "state") this.#setInputToDefault();
    }

    // sort
    sort(sortKey) {
        if (sortKey === "id") {
            (!this.#sortFlags[sortKey]) ? 
                this.#dataListToPrint.sort((a, b) => a[sortKey] - b[sortKey]) :
                this.#dataListToPrint.reverse();
        } else {
            if (sortKey === "state") {
                let states = new Set(this.#dataListToPrint.map(person => person.adress[sortKey]));
                if (states.size === 1) return;
            }

            (!this.#sortFlags[sortKey]) ? 
                this.#dataListToPrint.sort((a, b) => {
                    let propCondition = sortKey !== "state";
                    
                    let propOne = propCondition ? a[sortKey].toLowerCase() : a.adress[sortKey].toLowerCase();
                    let propTwo = propCondition ? b[sortKey].toLowerCase() : b.adress[sortKey].toLowerCase();

                    if (propOne < propTwo) return -1;
                    if (propOne > propTwo) return 1;
                    return 0;
                }) :
                this.#dataListToPrint.reverse();
        }

        for (let flag in this.#sortFlags) {
            this.#sortFlags[flag] = false;
        }
        this.#sortFlags[sortKey] = true;
        (this.#dataListToPrint.length > 21) ? this.#setPaginationControlToDefault() : this.#setPaginationControlToDisable();
        this.#printData(this.#dataListToPrint, 0, this.#dataListToPrint.length > 21 ? this.#maxNumberForPrint : this.#dataListToPrint.length);
        this.#isFilteredOrSorted = true;
    }

    // pagination
    paginate(target, indicator) {
        let zero = 0;
        let maxVal = Math.round(this.#dataListToPrint.length / this.#maxNumberForPrint);

        if (target.classList.contains("pagination-control__button-to-left") && indicator > (zero + 1)) {
            indicator--;
        } else if (target.classList.contains("pagination-control__button-to-right") && indicator < maxVal) {
            indicator++;
        }

        let panel = document.querySelector(".pagination-control__indicator");
        panel.textContent = `${indicator}`;


        let buttonToLeft = document.querySelector(".pagination-control__button-to-left");
        let buttonToRight = document.querySelector(".pagination-control__button-to-right");
        if (indicator === 1) {
            buttonToLeft.classList.add("pagination-control__button-to-left--disabled");
        }
        if (indicator === maxVal) {
            buttonToRight.classList.add("pagination-control__button-to-right--disabled");
        }
        if (indicator > 1 && indicator < maxVal) {
            buttonToLeft.classList.remove("pagination-control__button-to-left--disabled");
            buttonToRight.classList.remove("pagination-control__button-to-right--disabled");
        }

        let maxIndex = indicator * this.#maxNumberForPrint;
        let minIndex = maxIndex - this.#maxNumberForPrint;

        this.#printData(this.#dataListToPrint, minIndex, maxIndex);
        this.#isFilteredOrSorted = true;
    }

    // refresh
    refresh() {
        this.#setInputToDefault();
        this.#setFilterByStateMenuToDefault();
        if (!this.#isFilteredOrSorted) return;

        this.#dataListToPrint = this.#peopleDataList.slice();
        this.#printData(this.#peopleDataList);
        this.#setPaginationControlToDefault();
        this.#isFilteredOrSorted = false;
    }
       
    // to print data about persons in table
    #printData(listToPrint, min = 0, max = this.#maxNumberForPrint) {
        let tableBody = document.querySelector(".people-table__body");

        // delete old elements in table
        let rows = Array.from(document.querySelectorAll(".people-table__row"));
        for (let i = 1; i < rows.length; i++) {
            rows[i].remove();
        }
        
        // print empty table
        if (!listToPrint.length) {
            let emptyRow = document.createElement("tr");
            emptyRow.classList = "people-table__row";
            emptyRow.innerHTML += `
                <tr class="people-table__row">
                    <td class="people-table__cell">-</td>
                    <td class="people-table__cell">-</td>
                    <td class="people-table__cell">-</td>
                    <td class="people-table__cell">-</td>
                    <td class="people-table__cell">-</td>
                    <td class="people-table__cell">-</td>
                </tr>
            `;

            tableBody.append(emptyRow);
            return;
        }
        
        for (let i = min; i < max; i++) {
            let person = listToPrint[i];

            let personId = `${person.id}`;
            switch(personId.length) {
                case 2:
                    personId = "0" + personId;
                    break;

                case 1:
                    personId = "00" + personId;
                    break;
            }

            let dataRow = document.createElement("tr");
            dataRow.classList = "people-table__row";
            dataRow.innerHTML += `
                <tr class="people-table__row">
                    <td class="people-table__cell">${personId}</td>
                    <td class="people-table__cell">${person.firstName}</td>
                    <td class="people-table__cell">${person.lastName}</td>
                    <td class="people-table__cell">${person.email}</td>
                    <td class="people-table__cell">${person.phone}</td>
                    <td class="people-table__cell">${person.adress.state}</td>
                </tr>
            `;

            dataRow.dataset.localId = person.localId;
            tableBody.append(dataRow);
        }

        return;
    }

    // to print list of states to filtration
    #printStatesList() {
        let statesList = this.#peopleDataList.map(personData => personData.adress.state);
        let statesListWithoutDuplicates = Array.from(new Set(statesList)).sort((a, b) => {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });

        let listBase = document.querySelector(".filter-by-state__menu");
        statesListWithoutDuplicates.forEach(state => {
            listBase.innerHTML += `
                <li class="filter-by-state__menu-element" data-value="${state}">${state}</li>
            `;
        });
    }

    // set default state of pagination
    #setPaginationControlToDefault() {
        let panelOfPagination = document.querySelector(".pagination-control__indicator");
        panelOfPagination.textContent = "1";

        let buttonToLeft = document.querySelector(".pagination-control__button-to-left");
        buttonToLeft.classList.add("pagination-control__button-to-left--disabled");

        let buttonToRight = document.querySelector(".pagination-control__button-to-right");
        buttonToRight.classList.remove("pagination-control__button-to-right--disabled");
    }

    // set disable state of pagination
    #setPaginationControlToDisable() {
        let panelOfPagination = document.querySelector(".pagination-control__indicator");
        panelOfPagination.textContent = "1";
    
        let buttonToLeft = document.querySelector(".pagination-control__button-to-left");
        buttonToLeft.classList.add("pagination-control__button-to-left--disabled");
    
        let buttonToRight = document.querySelector(".pagination-control__button-to-right");
        buttonToRight.classList.add("pagination-control__button-to-right--disabled");
    }

    // set default state of input to filter by name
    #setInputToDefault() {
        let input = document.querySelector(".filter-by-name__input");
        input.value = "";
    }

    // set default state of menu to filter by state
    #setFilterByStateMenuToDefault() {
        let filterByStateMenu = document.querySelector(".filter-by-state__menu");
        filterByStateMenu.classList.add("none");
    }
}