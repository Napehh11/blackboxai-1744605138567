document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('inventoryForm');
    const listContainer = document.getElementById('listContainer');
    
    // Load saved data when page loads
    loadInventoryData();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const itemId = document.getElementById('itemId').value;
        const actualCount = document.getElementById('actualCount').value;
        const countDate = document.getElementById('countDate').value;
        const notes = document.getElementById('notes').value;
        
        // Create inventory object
        const inventoryItem = {
            itemId,
            actualCount,
            countDate,
            notes,
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        saveInventoryItem(inventoryItem);
        
        // Reload the list
        loadInventoryData();
        
        // Reset form
        form.reset();
    });

    function saveInventoryItem(item) {
        let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        inventory.push(item);
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }

    function loadInventoryData() {
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        listContainer.innerHTML = '';
        
        if (inventory.length === 0) {
            listContainer.innerHTML = '<p class="text-gray-500">Belum ada data stok opname</p>';
            return;
        }

        inventory.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'p-3 border rounded-lg hover:bg-gray-50';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-medium">${item.itemId}</h3>
                        <p class="text-sm text-gray-600">${item.countDate}</p>
                    </div>
                    <div class="text-right">
                        <span class="block text-lg font-semibold">${item.actualCount}</span>
                    </div>
                </div>
                ${item.notes ? `<p class="mt-2 text-sm text-gray-600">${item.notes}</p>` : ''}
                <button onclick="deleteItem(${index})" class="mt-2 text-red-500 text-sm hover:text-red-700">
                    <i class="fas fa-trash mr-1"></i>Hapus
                </button>
            `;
            listContainer.appendChild(itemDiv);
        });

        // Add export button if there's data
        if (inventory.length > 0) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700';
            exportBtn.innerHTML = '<i class="fas fa-file-export mr-2"></i>Export Data ke CSV';
            exportBtn.onclick = exportToCSV;
            listContainer.appendChild(exportBtn);
        }
    }

    window.deleteItem = function(index) {
        let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        inventory.splice(index, 1);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        loadInventoryData();
    };

    function exportToCSV() {
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        if (inventory.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        // Create CSV header
        let csv = 'Kode Barang,Stok Fisik,Tanggal Opname,Catatan\n';
        
        // Add data rows
        inventory.forEach(item => {
            csv += `"${item.itemId}",${item.actualCount},"${item.countDate}","${item.notes || ''}"\n`;
        });

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stok_opname_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
