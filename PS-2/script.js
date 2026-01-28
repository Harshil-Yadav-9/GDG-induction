let people = JSON.parse(localStorage.getItem('names')) || [];
let expenses = JSON.parse(localStorage.getItem('records')) || [];


const addPerson = () => {
    const name = name_input.value.trim();
    if (name && !people.includes(name)) {
        people.push(name);
        name_input.value = '';
        updateUI();
    }
}

const name_input = document.querySelector("#person-name");
name_input.addEventListener("keypress", async(e) =>{
    if(e.key === "Enter"){
        const query = name_input.value.trim();
        if(query && !people.includes(query)){
            people.push(query);
            name_input.value = '';
            updateUI();
        }
    }
});

const logExpense = () => {
    const desc = document.querySelector("#expense-dec").value;//discription
    const amt = parseFloat(document.querySelector("#expense-money").value);//amount
    const payer = document.querySelector("#payer").value;//who pays
            
    //get all checked beneficiaries
    const beneficiaries = [];
    document.querySelectorAll(".person-check:checked").forEach(c => {
        beneficiaries.push(c.value);
    });//for whom

    if (!amt || !payer || beneficiaries.length === 0) {
        alert("Please fill all fields and select at least one person to split with!");
        return;
    }//alert notification

    const newExp = {
        id: Date.now(),
        desc, 
        amt, 
        payer, 
        beneficiaries
    };
    expenses.push(newExp);
            
    //reset form
    document.querySelector("#expense-dec").value = "";
    document.querySelector("#expense-money").value = "";
    updateUI();
}

document.querySelector("#expense").addEventListener("click", logExpense);

const updateUI = () => {
    //save to localStorage
    localStorage.setItem('names', JSON.stringify(people));
    localStorage.setItem('records', JSON.stringify(expenses));

    //update payer dropdown and checkboxes
    const payerSelect = document.querySelector("#payer");//who paid
    const whomDiv = document.querySelector(".for-whom");//spilts among
    const personsDiv = document.querySelector(".person-list");
    
    personsDiv.innerHTML = ``;
    payerSelect.innerHTML = `<option value="">Who Paid?</option>`;
    whomDiv.innerHTML = ``;
    
    people.forEach(p => {
    personsDiv.innerHTML += `<span>${p}, </span>`;
    payerSelect.innerHTML += `<option value="${p}">${p}</option>`;
    whomDiv.innerHTML += `
        <label class="for-whom">
            <input type="checkbox" value="${p}" class="person-check" checked> ${p}
        </label>
        `;
    });

    const history = document.querySelector(".history-list");
    history.innerHTML = expenses.map(e => `
        <div>
            <div>
                <span class="his-list">${e.payer}</span> paid <b>$${e.amt}</b> for ${e.desc}
                <div class="spliting">Split: ${e.beneficiaries.join(', ')}</div>
            </div>
            <button onclick="deleteExpense(${e.id})" class="delete">
                Delete
            </button>
        </div>
    `).reverse().join('');//shows the newest expense at the top

    calculateSettlements();
}

function calculateSettlements() {
    let balances = {};
    people.forEach(p => balances[p] = 0);

    //calculate the people balances
    expenses.forEach(exp => {
        const share = exp.amt / exp.beneficiaries.length;
        balances[exp.payer] += exp.amt;
        exp.beneficiaries.forEach(p => balances[p] -= share);
    });

    //separate into debtors and creditors
    let debtors = [];
    let creditors = [];
    for(let name in balances) {
        let val = parseFloat(balances[name].toFixed(2)); //to the precision of 2 digit after decimal
        if (val < 0) debtors.push({ name, amt: Math.abs(val) });
        else if (val > 0) creditors.push({ name, amt: val });
    }

    const settlement = document.querySelector(".settlement-list");
    settlement.innerHTML = ``;

    while (debtors.length > 0 && creditors.length > 0) {
        //sort debtors and creditors so the person has more money as deb or credit is at the top
        debtors.sort((a, b) => b.amt - a.amt);
        creditors.sort((a, b) => b.amt - a.amt);

        let debtor = debtors[0];
        let creditor = creditors[0];
        let amount = Math.min(debtor.amt, creditor.amt);
        const sList = document.querySelector(".settlement-list");
        sList.innerHTML += `
            <div class="settlement">
                <b>${debtor.name}</b> pays <b>${creditor.name}</b>: <strong>$${amount.toFixed(2)}</strong>
            </div>
            `;

        debtor.amt -= amount;
        creditor.amt -= amount;

        //remove if they are complete for deb or credit
        if (debtor.amt < 0.01) debtors.shift();
        if (creditor.amt < 0.01) creditors.shift();
    }
}

updateUI();

function deleteExpense(id) {
    //filter the matched id and update the settlement
    expenses = expenses.filter(exp => exp.id !== id);
    updateUI();
}

function clearAll() {
    //corfirmation to clear the whole data
    if(confirm("Are you sure? This will delete all people and expenses!")){
        localStorage.clear();
        location.reload();
    }
}