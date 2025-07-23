document.addEventListener('DOMContentLoaded', function () {
    const expenseForm = document.getElementById('expenseForm');
    const table = document.getElementById('expenseTableBody');
    let editingRow = null;

    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value.trim();
        const date = document.getElementById('date').value;

        // Validation: no zero/negative or empty
        if (amount <= 0 || isNaN(amount)) {
            alert("Amount must be greater than zero!");
            document.getElementById('amount').focus();
            return;
        }

        const formattedAmount = `$${amount.toFixed(2)}`;

        if (editingRow) {
            // Update
            editingRow.children[0].textContent = date;
            editingRow.children[1].textContent = description;
            editingRow.children[2].textContent = category;
            editingRow.children[3].textContent = formattedAmount;
            editingRow = null;
            expenseForm.querySelector('button[type="submit"]').textContent = "Add Expense";
        } else {
            // Create new row with Bootstrap buttons
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date}</td>
                <td>${description}</td>
                <td>${category}</td>
                <td>${formattedAmount}</td>
                <td>
                    <button class="btn btn-outline-secondary btn-sm edit-btn"><span>&#9998;</span> Edit</button>
                    <button class="btn btn-outline-danger btn-sm delete-btn"><span>&#128465;</span> Delete</button>
                </td>
            `;
            table.appendChild(row);
        }

        this.reset();
    });

    // Edit and Delete actions for the table
    table.addEventListener('click', function(e) {
        if (e.target.closest('.delete-btn')) {
            const row = e.target.closest('tr');
            row.remove();
            if (editingRow === row) {
                expenseForm.reset();
                editingRow = null;
                expenseForm.querySelector('button[type="submit"]').textContent = "Add Expense";
            }
        } else if (e.target.closest('.edit-btn')) {
            const row = e.target.closest('tr');
            const cells = row.querySelectorAll('td');
            document.getElementById('date').value = cells[0].textContent;
            document.getElementById('description').value = cells[1].textContent;
            document.getElementById('category').value = cells[2].textContent;
            document.getElementById('amount').value = cells[3].textContent.replace('$','');
            editingRow = row;
            expenseForm.querySelector('button[type="submit"]').textContent = "Update Expense";
        }
    });
});
