document.addEventListener('DOMContentLoaded', function () {
    const LIFF_ID = "YOUR_LIFF_ID"; // <-- IMPORTANT: REPLACE WITH YOUR LIFF ID

    // DOM Elements
    const form = document.getElementById('splitBillForm');
    const billNameInput = document.getElementById('billName');
    const totalAmountInput = document.getElementById('totalAmount');
    const currencySelect = document.getElementById('currency');
    const transactionDateInput = document.getElementById('transactionDate');
    const descriptionInput = document.getElementById('description');

    const payerDisplay = document.getElementById('payerDisplay');
    const selectPayerBtn = document.getElementById('selectPayerBtn');
    const payerUserIdInput = document.getElementById('payerUserId');
    const payerDisplayNameInput = document.getElementById('payerDisplayName');

    const sharersDisplay = document.getElementById('sharersDisplay');
    const selectSharersBtn = document.getElementById('selectSharersBtn');

    const splitMethodSelect = document.getElementById('splitMethod');
    const splitDetailsContainer = document.getElementById('splitDetailsContainer');
    const detailsContainers = {
        equally: document.getElementById('splitEquallyInfo'),
        percentage: document.getElementById('splitByPercentageDetails'),
        amount: document.getElementById('splitByAmountDetails'),
        shares: document.getElementById('splitBySharesDetails')
    };
    const percentageInputsContainer = document.getElementById('percentageInputsContainer');
    const amountInputsContainer = document.getElementById('amountInputsContainer');
    const sharesInputsContainer = document.getElementById('sharesInputsContainer');

    const sharerCountEquallyEl = document.getElementById('sharerCountEqually');
    const amountPerPersonEquallyEl = document.getElementById('amountPerPersonEqually');
    const totalPercentageEl = document.getElementById('totalPercentage');
    const totalSpecifiedAmountEl = document.getElementById('totalSpecifiedAmount');
    const billTotalForCheckEl = document.getElementById('billTotalForCheck');
    const currencyForCheckEl = document.getElementById('currencyForCheck');
    const amountPerShareEl = document.getElementById('amountPerShare');
    const totalSharesCountEl = document.getElementById('totalSharesCount');

    const receiptImageUpload = document.getElementById('receiptImageUpload');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const submitBillBtn = document.getElementById('submitBillBtn');

    // State
    let currentUser = null; // { userId, displayName, pictureUrl }
    let payer = null; // { userId, displayName, pictureUrl }
    let sharers = []; // Array of { userId, displayName, pictureUrl }
    let uploadedFiles = []; // For image previews

    // --- LIFF Initialization ---
    async function initializeLiff() {
        try {
            console.log("Initializing LIFF...");
            await liff.init({ liffId: LIFF_ID });
            console.log("LIFF initialized.");

            if (!liff.isLoggedIn()) {
                console.log("User not logged in. Redirecting to login.");
                liff.login({ redirectUri: window.location.href });
                return; // Stop execution until login completes and page reloads
            }
            console.log("User is logged in.");

            currentUser = await liff.getProfile();
            console.log("Current user profile:", currentUser);

            // Set current user as default payer
            setPayer(currentUser);
            // Add current user as a default sharer (can be removed)
            addSharer(currentUser);


        } catch (error) {
            console.error("LIFF Initialization failed:", error);
            payerDisplay.innerHTML = `<span class="text-red-500 text-sm">LIFF 初始化失敗: ${error.message}</span>`;
        }
    }

    // --- UI Update Functions ---
    function setPayer(user) {
        payer = user;
        payerUserIdInput.value = user.userId;
        payerDisplayNameInput.value = user.displayName;
        renderPayerDisplay();
        // If payer is also a sharer, ensure they are in the list and selected
        if (!sharers.find(s => s.userId === user.userId)) {
             // addSharer(user); // Decided to add payer as default sharer in init instead
        }
        updateAllCalculations();
    }

    function renderPayerDisplay() {
        payerDisplay.innerHTML = ''; // Clear
        if (payer) {
            const tag = createUserTag(payer, false, () => { /* Payer cannot be removed this way, use selectPayerBtn */ });
            payerDisplay.appendChild(tag);
        } else {
            payerDisplay.innerHTML = `<span class="italic text-slate-400 text-sm">點擊按鈕選擇出錢者</span>`;
        }
    }

    function addSharer(user) {
        if (user && !sharers.find(s => s.userId === user.userId)) {
            sharers.push(user);
            renderSharersDisplay();
            generateDetailedSplitInputs();
            updateAllCalculations();
        }
    }

    function removeSharer(userIdToRemove) {
        sharers = sharers.filter(s => s.userId !== userIdToRemove);
        renderSharersDisplay();
        generateDetailedSplitInputs();
        updateAllCalculations();
        // If the removed sharer was the payer, a new payer needs to be selected.
        // Or, ensure payer is always a sharer (common).
        if(payer && payer.userId === userIdToRemove) {
            // This logic might need adjustment: if payer is removed as sharer, should they still be payer?
            // For now, assume payer is always part of the split.
            // To truly remove payer, one would click "Select Payer" again.
        }
    }

    function renderSharersDisplay() {
        sharersDisplay.innerHTML = ''; // Clear
        if (sharers.length > 0) {
            sharers.forEach(sharer => {
                const tag = createUserTag(sharer, true, () => removeSharer(sharer.userId));
                sharersDisplay.appendChild(tag);
            });
        } else {
            sharersDisplay.innerHTML = `<span class="italic text-slate-400 text-sm">點擊按鈕選擇分攤者</span>`;
        }
    }

    function createUserTag(user, isRemovable, onRemove) {
        const tag = document.createElement('span');
        tag.className = 'flex items-center bg-sky-100 text-sky-700 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm';

        if (user.pictureUrl) {
            const img = document.createElement('img');
            img.src = user.pictureUrl;
            img.alt = user.displayName;
            img.className = 'w-5 h-5 rounded-full mr-2 object-cover';
            tag.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-user-circle text-sky-500 mr-2 text-base';
            tag.appendChild(icon);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = user.displayName;
        tag.appendChild(nameSpan);

        if (isRemovable) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'ml-2 text-sky-500 hover:text-sky-700 focus:outline-none';
            removeBtn.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
            removeBtn.onclick = onRemove;
            tag.appendChild(removeBtn);
        }
        return tag;
    }


    function updateSplitDetailsVisibility() {
        const selectedMethod = splitMethodSelect.value;
        Object.values(detailsContainers).forEach(container => container.classList.add('hidden'));
        if (detailsContainers[selectedMethod]) {
            detailsContainers[selectedMethod].classList.remove('hidden');
        }
        generateDetailedSplitInputs(); // Regenerate inputs when method changes
        updateAllCalculations();
    }

    function generateDetailedSplitInputs() {
        percentageInputsContainer.innerHTML = '';
        amountInputsContainer.innerHTML = '';
        sharesInputsContainer.innerHTML = '';
        const method = splitMethodSelect.value;

        if (sharers.length === 0 || method === 'equally') {
            updateAllCalculations(); // Still update "equally" section display
            return;
        }

        sharers.forEach(sharer => {
            let inputRow;
            if (method === 'percentage') {
                inputRow = createDetailInputRow(sharer, 'percentage', '%', '0', '100', '0.01', '50'); // Default 50% placeholder
                percentageInputsContainer.appendChild(inputRow);
            } else if (method === 'amount') {
                inputRow = createDetailInputRow(sharer, 'amount', currencySelect.value, '0', null, '0.01', '100');
                amountInputsContainer.appendChild(inputRow);
            } else if (method === 'shares') {
                inputRow = createDetailInputRow(sharer, 'shares', '份', '1', null, '1', '1'); // Default 1 share
                sharesInputsContainer.appendChild(inputRow);
            }
        });
        attachSplitDetailInputListeners();
        updateAllCalculations();
    }

    function createDetailInputRow(sharer, type, unit, min, max, step, placeholder) {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2 bg-slate-50 p-2 rounded';

        const label = document.createElement('label');
        label.setAttribute('for', `${type}_${sharer.userId}`);
        label.className = 'text-sm text-slate-700 w-2/5 truncate'; // Use truncate for long names
        label.textContent = sharer.displayName;

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'relative w-3/5';

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `${type}_${sharer.userId}`;
        input.name = `${type}_${sharer.userId}`;
        input.dataset.userId = sharer.userId;
        input.className = `${type}-input block w-full rounded-md border-slate-300 py-1.5 px-2 text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`;
        if (min !== null) input.min = min;
        if (max !== null) input.max = max;
        if (step !== null) input.step = step;
        if (placeholder !== null) input.placeholder = placeholder;

        inputWrapper.appendChild(input);
        // Unit display (optional, if not in placeholder)
        // const unitSpan = document.createElement('span');
        // unitSpan.className = 'absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-500';
        // unitSpan.textContent = unit;
        // inputWrapper.appendChild(unitSpan);


        div.appendChild(label);
        div.appendChild(inputWrapper);
        return div;
    }

    function attachSplitDetailInputListeners() {
        document.querySelectorAll('.percentage-input, .amount-input, .shares-input').forEach(input => {
            input.addEventListener('input', updateAllCalculations);
            input.addEventListener('blur', updateAllCalculations); // Recalculate on blur too
        });
    }

    function updateAllCalculations() {
        const method = splitMethodSelect.value;
        const totalAmount = parseFloat(totalAmountInput.value) || 0;
        const currentCurrency = currencySelect.value;

        // Update currency displays
        amountPerPersonEquallyEl.textContent = ` ${currentCurrency} 0.00`;
        currencyForCheckEl.textContent = currentCurrency;
        amountPerShareEl.textContent = ` ${currentCurrency} 0.00`;


        sharerCountEquallyEl.textContent = sharers.length;
        if (method === 'equally') {
            const amountPerPerson = sharers.length > 0 ? (totalAmount / sharers.length).toFixed(2) : 0;
            amountPerPersonEquallyEl.textContent = `${currentCurrency} ${amountPerPerson}`;
        } else if (method === 'percentage') {
            let currentTotalPercentage = 0;
            document.querySelectorAll('.percentage-input').forEach(input => {
                currentTotalPercentage += parseFloat(input.value) || 0;
            });
            totalPercentageEl.textContent = currentTotalPercentage.toFixed(2);
            totalPercentageEl.className = Math.abs(currentTotalPercentage - 100) > 0.01 && sharers.length > 0 ? 'text-red-600 font-bold' : 'text-indigo-600';
        } else if (method === 'amount') {
            let currentTotalSpecifiedAmount = 0;
            document.querySelectorAll('.amount-input').forEach(input => {
                currentTotalSpecifiedAmount += parseFloat(input.value) || 0;
            });
            totalSpecifiedAmountEl.textContent = currentTotalSpecifiedAmount.toFixed(2);
            billTotalForCheckEl.textContent = totalAmount.toFixed(2);
            totalSpecifiedAmountEl.className = Math.abs(currentTotalSpecifiedAmount - totalAmount) > 0.01 && sharers.length > 0 ? 'text-red-600 font-bold' : 'text-indigo-600';

        } else if (method === 'shares') {
            let totalShares = 0;
            document.querySelectorAll('.shares-input').forEach(input => {
                totalShares += parseInt(input.value) || 0;
            });
            totalSharesCountEl.textContent = totalShares;
            const amountPerShare = totalShares > 0 ? (totalAmount / totalShares).toFixed(2) : 0;
            amountPerShareEl.textContent = `${currentCurrency} ${amountPerShare}`;
        }
    }

    function handleImageUpload(event) {
        const files = event.target.files;
        imagePreviewContainer.innerHTML = ''; // Clear previous previews
        uploadedFiles = []; // Reset uploaded files state

        if (files.length > 5) {
            alert("最多只能上傳 5 張圖片。");
            receiptImageUpload.value = ""; // Clear the selection
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert(`檔案 "${file.name}" 過大 (上限5MB)。`);
                continue;
            }
            uploadedFiles.push(file); // Store for later submission

            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'relative aspect-square border rounded-md overflow-hidden group';
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.className = 'w-full h-full object-cover';
                div.appendChild(img);

                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity';
                removeBtn.innerHTML = '<i class="fa-solid fa-times text-xs"></i>';
                removeBtn.onclick = () => {
                    div.remove();
                    uploadedFiles = uploadedFiles.filter(f => f !== file);
                };
                div.appendChild(removeBtn);
                imagePreviewContainer.appendChild(div);
            }
            reader.readAsDataURL(file);
        }
    }


    // --- Event Listeners ---
    selectPayerBtn.addEventListener('click', async () => {
        if (!liff.isInClient()) {
            alert("請在 LINE App 中操作以選擇使用者。");
            // Simulate for web testing
            const name = prompt("輸入出錢者名稱:", currentUser?.displayName || "測試付款人");
            if (name) {
                setPayer({ userId: `web_${Date.now()}`, displayName: name, pictureUrl: null });
            }
            return;
        }
        try {
            // LIFF shareTargetPicker can be used to select friends
            // It's designed for sharing messages, but can be adapted
            // For a more robust solution, you might need a custom user selection UI
            // if liff.getFriends() or similar isn't available/suitable.
            const result = await liff.shareTargetPicker([
                { type: "text", text: "選擇這位朋友作為出錢者" } // Dummy message
            ], { isMultiple: false });

            if (result && result.status === "success" && result.targets && result.targets.length > 0) {
                // This is a conceptual adaptation. shareTargetPicker doesn't directly return profile info.
                // You'd typically get a target (e.g., a chat) to send a message to.
                // A more practical approach for LIFF *might* involve:
                // 1. A server-side list of group members if in a group.
                // 2. A custom HTML interface to pick from liff.getFriends() if that API is suitable and approved.
                // For now, let's assume we can get profile info or simulate it.
                alert("shareTargetPicker is complex for direct profile selection. Simulating with current user or prompt.");
                // const profile = await liff.getProfile(); // Or get from a custom selection
                setPayer(currentUser); // For demo, re-set to current user.
            } else {
                 // Simulate for now if shareTargetPicker is not ideal
                const name = prompt("輸入出錢者名稱:", currentUser?.displayName || "測試付款人");
                if (name) {
                    setPayer({ userId: `web_${Date.now()}`, displayName: name, pictureUrl: currentUser?.pictureUrl });
                }
            }
        } catch (error) {
            console.error("Error selecting payer:", error);
            alert("選擇出錢者時發生錯誤：" + error.message);
        }
    });

    selectSharersBtn.addEventListener('click', async () => {
        if (!liff.isInClient()) {
            alert("請在 LINE App 中操作以選擇使用者。");
            // Simulate for web testing
            const name = prompt("輸入分攤者名稱:", "測試分攤者" + (sharers.length + 1));
            if (name) {
                addSharer({ userId: `web_sharer_${Date.now()}`, displayName: name, pictureUrl: null });
            }
            return;
        }
        try {
            // Using shareTargetPicker for multiple users, similar caveats as above
            // This is a placeholder for a proper multi-user selection flow in LIFF
            const result = await liff.shareTargetPicker([
                 { type: "text", text: "選擇朋友一起分攤這筆帳單" }
            ], { isMultiple: true });

            if (result && result.status === "success" && result.targets) {
                alert(`shareTargetPicker (isMultiple) chose ${result.targets.length} targets. Profile data needs to be fetched or managed differently.\nSimulating adding current user if not already a sharer.`);
                // For a real app, you'd need to map these targets to user profiles.
                // For now, if current user is not a sharer, add them.
                if (currentUser && !sharers.find(s => s.userId === currentUser.userId)) {
                    addSharer(currentUser);
                } else {
                    // Add a mock user if current user is already there
                    const mockName = "模擬好友" + Math.floor(Math.random()*100);
                     addSharer({ userId: `mock_${Date.now()}`, displayName: mockName, pictureUrl: null });
                }
            } else {
                 // Simulate
                const name = prompt("輸入分攤者名稱:", "測試分攤者" + (sharers.length + 1));
                if (name) {
                    addSharer({ userId: `web_sharer_${Date.now()}`, displayName: name, pictureUrl: null });
                }
            }
        } catch (error) {
            console.error("Error selecting sharers:", error);
            alert("選擇分攤者時發生錯誤：" + error.message);
        }
    });


    splitMethodSelect.addEventListener('change', updateSplitDetailsVisibility);
    [totalAmountInput, currencySelect].forEach(el => el.addEventListener('input', updateAllCalculations));
    transactionDateInput.valueAsDate = new Date(); // Set default date to today

    receiptImageUpload.addEventListener('change', handleImageUpload);

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        submitBillBtn.disabled = true;
        submitBillBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>處理中...';

        // Basic Validations
        if (!billNameInput.value.trim()) {
            alert("請輸入帳單名稱！");
            billNameInput.focus();
            submitBillBtn.disabled = false;
            submitBillBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>建立分帳';
            return;
        }
        if (parseFloat(totalAmountInput.value) <= 0 || isNaN(parseFloat(totalAmountInput.value))) {
            alert("請輸入有效的總金額！");
            totalAmountInput.focus();
            submitBillBtn.disabled = false;
            submitBillBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>建立分帳';
            return;
        }
        if (!payer || !payer.userId) {
            alert("請選擇出錢者！");
            submitBillBtn.disabled = false;
            submitBillBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>建立分帳';
            return;
        }
        if (sharers.length === 0) {
            alert("請選擇至少一位分攤者！");
            submitBillBtn.disabled = false;
            submitBillBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>建立分帳';
            return;
        }
        // Ensure payer is one of the sharers
        if (!sharers.find(s => s.userId === payer.userId)) {
            alert("出錢的人也必須是分攤者之一！請將出錢者加入分攤列表。");
             submitBillBtn.disabled = false;
            submitBillBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>建立分帳';
            return;
        }


        const billData = {
            billName: billNameInput.value.trim(),
            totalAmount: parseFloat(totalAmountInput.value),
            currency: currencySelect.value,
            transactionDate: transactionDateInput.value,
            description: descriptionInput.value.trim(),
            payer: { userId: payer.userId, displayName: payer.displayName },
            sharers: sharers.map(s => ({ userId: s.userId, displayName: s.displayName })),
            splitMethod: splitMethodSelect.value,
            splitDetails: {},
            notes: descriptionInput.value.trim(), // Using description as notes for simplicity here
            // receiptImageUrls will be handled by backend after upload
            createdBy: currentUser ? currentUser.userId : 'unknown_liff_user',
            liffContext: { // Send some LIFF context if available
                type: liff.getContext()?.type,
                viewType: liff.getContext()?.viewType,
                userId: liff.getContext()?.userId,
                groupId: liff.getContext()?.groupId,
                roomId: liff.getContext()?.roomId,
            }
        };

        // Populate splitDetails based on method
        const method = billData.splitMethod;
        if (method === 'percentage') {
            billData.splitDetails = sharers.map(sharer => ({
                userId: sharer.userId,
                percentage: parseFloat(document.getElementById(`percentage_${sharer.userId}`)?.value) || 0
            }));
            const totalPercentage = billData.splitDetails.reduce((sum, item) => sum + item.percentage, 0);
            if (Math.abs(totalPercentage - 100) > 0.01) {
                alert("百分比總和必須為 100%！");
                submitBillBtn.disabled = false;
                submitBillBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>建立分帳';
                return;
            }
        } else if (method === 'amount') {
            billData.splitDetails = sharers.map(sharer => ({
                userId: sharer.userId,
                amount: parseFloat(document.getElementById(`amount_${sharer.userId}`)?.value) || 0
            }));
            const totalSpecifiedAmount = billData.splitDetails.reduce((sum, item) => sum + item.amount, 0);
            if (Math.abs(totalSpecifiedAmount - billData.totalAmount) > 0.01) {
                alert("指定金額總和必須等於總金額！");
                submitBillBtn.disabled = false;
                submitBillBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>建立分帳';
                return;
            }
        } else if (method === 'shares') {
            billData.splitDetails = sharers.map(sharer => ({
                userId: sharer.userId,
                shares: parseInt(document.getElementById(`shares_${sharer.userId}`)?.value) || 0
            }));
            if (billData.splitDetails.some(s => s.shares <=0)){
                alert("所有人的份額數都必須大於0！");
                submitBillBtn.disabled = false;
                submitBillBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>建立分帳';
                return;
            }
        }

        console.log("Form Data to be submitted:", JSON.stringify(billData, null, 2));
        // console.log("Uploaded files (to be handled):", uploadedFiles);

        // --- Mock API Submission ---
        try {
            // Here you would handle file uploads first if any, then submit billData
            // For example, upload each file in `uploadedFiles` to your server,
            // get back URLs, and add them to `billData.receiptImageUrls`.

            // const apiResponse = await fetch('/api/your-bill-endpoint', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${liff.getAccessToken()}` // If your API needs auth
            //     },
            //     body: JSON.stringify(billData)
            // });

            // if (!apiResponse.ok) {
            //     const errorResult = await apiResponse.json();
            //     throw new Error(errorResult.message || `API Error: ${apiResponse.status}`);
            // }
            // const successResult = await apiResponse.json();
            // console.log("API Success:", successResult);

            // Simulate success after 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert("帳單已成功建立！ (模擬)");

            if (liff.isInClient()) {
                const messages = [{
                    type: 'text',
                    text: `🎉 新分帳「${billData.billName}」已建立！總金額 ${billData.currency} ${billData.totalAmount}`
                }];
                // Add Flex Message for richer display if desired

                // liff.sendMessages(messages) // Optional: Send message back to chat
                //     .then(() => {
                //         console.log("Message sent successfully");
                //         liff.closeWindow();
                //     })
                //     .catch((err) => {
                //         console.error("Error sending message:", err);
                //         liff.closeWindow(); // Still close window
                //     });
                liff.closeWindow(); // Close LIFF
            }

        } catch (error) {
            console.error("Submission error:", error);
            alert("建立帳單失敗：" + error.message);
            submitBillBtn.disabled = false;
            submitBillBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>建立分帳';
        }
    });

    // Initial setup
    initializeLiff().then(() => {
        updateSplitDetailsVisibility(); // Ensure correct section is shown initially
        // Any other setup that depends on LIFF profile
    });
});