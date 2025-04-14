document.addEventListener('DOMContentLoaded', function() {
    // Show/hide marketplace fields based on selection
    const marketplaceSelect = document.getElementById('marketplaceSelect');
    const marketplaceFields = document.getElementById('marketplaceFields');
    
    marketplaceSelect.addEventListener('change', function() {
        marketplaceFields.classList.toggle('hidden', this.value === 'none');
    });

    // Enable/disable shipping value input
    const shippingType = document.getElementById('marketplaceShippingType');
    const shippingValue = document.getElementById('marketplaceShippingValue');
    
    shippingType.addEventListener('change', function() {
        shippingValue.disabled = this.value === 'none';
        if (this.value === 'none') shippingValue.value = '';
    });

    // Initialize markup type selection
    document.getElementById('markupType').addEventListener('change', function() {
        document.getElementById('percentageField').classList.toggle('hidden', this.value !== 'percentage');
        document.getElementById('fixedField').classList.toggle('hidden', this.value !== 'fixed');
    });

    // Initialize PPN options
    const ppnOptions = document.querySelectorAll('input[name="ppnOption"]');
    ppnOptions.forEach(option => {
        option.addEventListener('change', () => {
            document.getElementById('calculateBtn').click();
        });
    });

    // Calculate button handler
    document.getElementById('calculateBtn').addEventListener('click', calculatePrice);

    function calculatePrice() {
        try {
            // Show loading state
            const btn = document.getElementById('calculateBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Calculating...';
            // Get input values
            const productCost = parseFloat(document.getElementById('productCost').value) || 0;
            const markupType = document.getElementById('markupType').value;
            let markupAmount = 0;

            // Calculate markup
            if (markupType === 'percentage') {
                const markupPercentage = parseFloat(document.getElementById('markupPercentage').value) || 0;
                markupAmount = (markupPercentage / 100) * productCost;
            } else {
                markupAmount = parseFloat(document.getElementById('fixedMarkup').value) || 0;
            }

            const sellingPrice = productCost + markupAmount;

            // Format currency
            const formatCurrency = (value) => {
                return 'Rp' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            };

            // Calculate marketplace fees
            let totalFees = 0;
            const feeDetails = document.getElementById('feeDetails');
            feeDetails.innerHTML = '';

            const selectedMarketplace = marketplaceSelect.value;
            if (selectedMarketplace !== 'none') {
                let marketplaceTotal = 0;
                let feeElements = [];
                const marketplaceName = selectedMarketplace.charAt(0).toUpperCase() + selectedMarketplace.slice(1);
                
                // Commission
                const commissionRate = parseFloat(document.getElementById('marketplaceCommission').value) || 0;
                if (commissionRate > 0) {
                    const commissionAmount = (commissionRate / 100) * sellingPrice;
                    marketplaceTotal += commissionAmount;
                    feeElements.push(`
                        <div class="flex justify-between">
                            <span class="text-gray-600 text-sm">${marketplaceName} Commission (${commissionRate}%):</span>
                            <span class="text-sm">${formatCurrency(commissionAmount)}</span>
                        </div>
                    `);
                }

                // Campaign
                const campaignRate = parseFloat(document.getElementById('marketplaceCampaign').value) || 0;
                if (campaignRate > 0) {
                    const campaignAmount = (campaignRate / 100) * sellingPrice;
                    marketplaceTotal += campaignAmount;
                    feeElements.push(`
                        <div class="flex justify-between">
                            <span class="text-gray-600 text-sm">${marketplaceName} Campaign (${campaignRate}%):</span>
                            <span class="text-sm">${formatCurrency(campaignAmount)}</span>
                        </div>
                    `);
                }

                // Shipping
                const shippingType = document.getElementById('marketplaceShippingType').value;
                const shippingValue = parseFloat(document.getElementById('marketplaceShippingValue').value) || 0;
                
                if (shippingType === 'fixed' && shippingValue > 0) {
                    marketplaceTotal += shippingValue;
                    feeElements.push(`
                        <div class="flex justify-between">
                            <span class="text-gray-600 text-sm">${marketplaceName} Shipping:</span>
                            <span class="text-sm">${formatCurrency(shippingValue)}</span>
                        </div>
                    `);
                } else if (shippingType === 'percent' && shippingValue > 0) {
                    const shippingAmount = (shippingValue / 100) * sellingPrice;
                    marketplaceTotal += shippingAmount;
                    feeElements.push(`
                        <div class="flex justify-between">
                            <span class="text-gray-600 text-sm">${marketplaceName} Shipping (${shippingValue}%):</span>
                            <span class="text-sm">${formatCurrency(shippingAmount)}</span>
                        </div>
                    `);
                }

                // Add marketplace fees to total
                if (marketplaceTotal > 0) {
                    totalFees += marketplaceTotal;
                    feeDetails.innerHTML = `
                        <div class="mb-4">
                            <div class="font-medium text-sm mb-1">${marketplaceName} Fees</div>
                            ${feeElements.join('')}
                            <div class="flex justify-between border-t border-gray-200 mt-1 pt-1">
                                <span class="text-gray-600 text-sm font-medium">Total Fees:</span>
                                <span class="text-sm font-medium">${formatCurrency(marketplaceTotal)}</span>
                            </div>
                        </div>
                    `;
                }
            }

            // Calculate final price with PPN
            let finalPrice = sellingPrice + totalFees;
            const includePPN = document.querySelector('input[name="ppnOption"]:checked').value === 'include';
            let ppnAmount = 0;
            
            if (includePPN) {
                ppnAmount = finalPrice * 0.11;
                finalPrice += ppnAmount;
                feeDetails.innerHTML += `
                    <div class="flex justify-between border-t-2 border-gray-300 pt-2 mt-2">
                        <span class="text-gray-600 font-medium">PPN (11%):</span>
                        <span class="font-medium">${formatCurrency(ppnAmount)}</span>
                    </div>
                `;
            }

            // Display results
            document.getElementById('displayCost').innerText = formatCurrency(productCost);
            document.getElementById('displayMarkup').innerText = formatCurrency(markupAmount);
            document.getElementById('displayBasePrice').innerText = formatCurrency(sellingPrice);
            document.getElementById('displayFinalPrice').innerText = formatCurrency(finalPrice);
            document.getElementById('result').classList.remove('hidden');

        } catch (error) {
            console.error('Calculation error:', error);
            alert('Terjadi kesalahan dalam perhitungan. Pastikan semua input valid.');
        } finally {
            // Reset button state
            const btn = document.getElementById('calculateBtn');
            btn.disabled = false;
            btn.textContent = 'Calculate Selling Price';
        }
    }
});
