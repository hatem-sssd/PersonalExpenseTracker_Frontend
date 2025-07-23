document.addEventListener('DOMContentLoaded', function () {
    // ====== CONFIG: YOUR BACKEND URL HERE ======
    const API_URL = "https://personalexpensetracker-backend-19wf.onrender.com/expenses";

    const expenseForm = document.getElementById('expenseForm');
    const table = document.getElementById('expenseTableBody');
    let editingRow = null;
    let editingId = null;

    // Helper function: render a row
    function addRow(expense) {
        const row = document.createElement('tr');
        row.dataset.id = expense._id;
        row.innerHTML = `
            <td>${expense.date ? expense.date.substring(0, 10) : ''}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>$${parseFloat(expense.amount).toFixed(2)}</td>
            <td>
                <button class="btn btn-outline-secondary btn-sm edit-btn">&#9998; Edit</button>
                <button class="btn btn-outline-danger btn-sm delete-btn">&#128465; Delete</button>
            </td>
        `;
        table.appendChild(row);
    }

    // ===== Load existing expenses on page load =====
    fetch(API_URL)
        .then(res => res.json())
        .then(expenses => {
            table.innerHTML = ""; // Clear existing
            expenses.forEach(exp => addRow(exp));
        })
        .catch(() => alert("Could not fetch expenses from backend!"));

    // ===== Add or Update Expense =====
    expenseForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value.trim();
        const date = document.getElementById('date').value;

        if (amount <= 0 || isNaN(amount)) {
            alert("Amount must be greater than zero!");
            document.getElementById('amount').focus();
            return;
        }

        if (editingRow && editingId) {
            // UPDATE
            fetch(`${API_URL}/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, amount, category, date })
            })
                .then(res => res.json())
                .then(updated => {
                    editingRow.children[0].textContent = updated.date ? updated.date.substring(0, 10) : '';
                    editingRow.children[1].textContent = updated.description;
                    editingRow.children[2].textContent = updated.category;
                    editingRow.children[3].textContent = `$${parseFloat(updated.amount).toFixed(2)}`;
                    editingRow = null;
                    editingId = null;
                    expenseForm.querySelector('button[type="submit"]').textContent = "Add Expense";
                })
                .catch(() => alert("Error updating expense on backend!"));
        } else {
            // CREATE
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, amount, category, date })
            })
                .then(res => res.json())
                .then(newExp => {
                    addRow(newExp);
                })
                .catch(() => alert("Error adding expense to backend!"));
        }

        this.reset();
    });

    // ===== Edit & Delete Buttons =====
    table.addEventListener('click', function (e) {
        if (e.target.closest('.delete-btn')) {
            const row = e.target.closest('tr');
            const id = row.dataset.id;
            fetch(`${API_URL}/${id}`, { method: 'DELETE' })
                .then(() => row.remove())
                .catch(() => alert("Error deleting expense from backend!"));
            if (editingRow === row) {
                expenseForm.reset();
                editingRow = null;
                editingId = null;
                expenseForm.querySelector('button[type="submit"]').textContent = "Add Expense";
            }
        } else if (e.target.closest('.edit-btn')) {
            const row = e.target.closest('tr');
            const cells = row.querySelectorAll('td');
            document.getElementById('date').value = cells[0].textContent;
            document.getElementById('description').value = cells[1].textContent;
            document.getElementById('category').value = cells[2].textContent;
            document.getElementById('amount').value = cells[3].textContent.replace('$', '');
            editingRow = row;
            editingId = row.dataset.id;
            expenseForm.querySelector('button[type="submit"]').textContent = "Update Expense";
        }
    });

    // ===== Export to CSV Functionality =====
    function exportTableToCSV(filename) {
        const rows = document.querySelectorAll("#expenseTableBody tr");
        let csv = "Date,Description,Category,Amount\n";
        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const rowData = [
                cells[0]?.textContent,
                cells[1]?.textContent,
                cells[2]?.textContent,
                cells[3]?.textContent.replace('$','')
            ].map(val => `"${val}"`).join(",");
            csv += rowData + "\n";
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    // Attach event listener to the Export button
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            exportTableToCSV('expenses.csv');
        });
    }
});
