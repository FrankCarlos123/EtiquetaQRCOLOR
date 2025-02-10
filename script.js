// Variables globales
let selectedLabels = [];

// Constantes
const MM_TO_PX = 3.7795275591;
// Función para manejar el resaltado
function handleHighlight(index, highlight) {
    // Resaltar el número del código
    const codeContainer = document.querySelector(`.code-input-container:nth-child(${index + 1})`);
    if (codeContainer) {
        const codeNumber = codeContainer.querySelector('.code-number');
        if (codeNumber) {
            if (highlight) {
                codeNumber.classList.add('active-number');
            } else {
                codeNumber.classList.remove('active-number');
            }
        }
    }

    // Resaltar el número de la etiqueta
    if (selectedLabels[index]) {
        const labelNumber = selectedLabels[index].row.querySelector('.label-number');
        if (labelNumber) {
            if (highlight) {
                labelNumber.classList.add('active-number');
            } else {
                labelNumber.classList.remove('active-number');
            }
        }
    }
}

// Función para generar inputs de códigos QR (actualizada)
function generateCodeInputs(count) {
    const codesGrid = document.getElementById('codesGrid');
    codesGrid.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'code-input-container';
        
        // Crear etiqueta con número
        const numberLabel = document.createElement('div');
        numberLabel.className = 'code-number';
        numberLabel.textContent = `${i}`;
        
        // Crear input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'code-input';
        input.id = `qrCode${i}`;
        input.placeholder = `Código QR ${i}`;
        
        // Agregar eventos de hover
        inputContainer.addEventListener('mouseenter', () => handleHighlight(i - 1, true));
        inputContainer.addEventListener('mouseleave', () => handleHighlight(i - 1, false));
        
        input.addEventListener('input', (e) => {
            const code = cleanCode(e.target.value);
            if (code.length > 0 && !isValidCode(code)) {
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
                if (isValidCode(code)) {
                    updateQRCode(i - 1, code);
                }
            }
        });
        
        inputContainer.appendChild(numberLabel);
        inputContainer.appendChild(input);
        codesGrid.appendChild(inputContainer);
    }
}

// Función para añadir una etiqueta (actualizada)
function addLabel(productName, imgSrc, qrData, index) {
    const labelRow = document.createElement('div');
    labelRow.classList.add('label-row');

    const labelNumber = document.createElement('div');
    labelNumber.classList.add('label-number');
    labelNumber.textContent = (index + 1).toString();
    labelRow.appendChild(labelNumber);

    const productCell = document.createElement('div');
    productCell.classList.add('product-cell');
    const productImg = document.createElement('img');
    productImg.src = imgSrc;
    productCell.appendChild(productImg);

    handleDragEvents(productCell, productImg);

    const nameCell = document.createElement('div');
    nameCell.classList.add('name-cell');
    const nameTextarea = document.createElement('textarea');
    nameTextarea.value = productName;
    nameTextarea.addEventListener('input', function() {
        adjustFontSize(this);
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, this.parentElement.offsetHeight - 4) + 'px';
    });
    nameCell.appendChild(nameTextarea);

    const qrCell = document.createElement('div');
    qrCell.classList.add('qr-cell');
    const qrImg = document.createElement('img');
    qrImg.src = qrData;
    qrCell.appendChild(qrImg);

    labelRow.appendChild(productCell);
    labelRow.appendChild(nameCell);
    labelRow.appendChild(qrCell);

    // Agregar eventos de hover a la etiqueta
    labelRow.addEventListener('mouseenter', () => handleHighlight(index, true));
    labelRow.addEventListener('mouseleave', () => handleHighlight(index, false));

    document.getElementById('labelsContainer').appendChild(labelRow);
    selectedLabels.push({
        imgElement: productImg,
        nameInput: nameTextarea,
        qrImg,
        row: labelRow
    });
}
// Funciones de conversión
function mmToPx(mm) {
    return Math.round(mm * MM_TO_PX);
}

function pxToMm(px) {
    return Math.round((px / MM_TO_PX) * 10) / 10;
}

// Función para validar dimensiones
function validateDimensions(width, height) {
    const minWidth = 25;
    const minHeight = 15;
    
    if (width < minWidth) {
        document.getElementById('labelWidth').value = minWidth;
        alert('El ancho mínimo es 25mm');
        return false;
    }
    if (height < minHeight) {
        document.getElementById('labelHeight').value = minHeight;
        alert('La altura mínima es 15mm');
        return false;
    }
    return true;
}

// Función para validar códigos
function isValidCode(code) {
    const cleanCode = code.replace(/\D/g, '');
    return cleanCode.length === 13 || cleanCode.length === 14;
}

// Función para limpiar código
function cleanCode(code) {
    return code.replace(/\D/g, '').trim();
}

// Función para ajustar el tamaño de fuente
function adjustFontSize(textarea) {
    // Guardamos el texto original
    const text = textarea.value;
    const containerWidth = textarea.parentElement.offsetWidth - 10; // -10 para padding
    const containerHeight = textarea.parentElement.offsetHeight - 10;

    // Empezamos con un tamaño grande y vamos reduciendo
    let fontSize = 24;
    const minFontSize = 12;

    textarea.style.fontSize = `${fontSize}px`;
    
    // Ajustamos el tamaño hasta que el texto quepa
    while ((textarea.scrollWidth > containerWidth || 
            textarea.scrollHeight > containerHeight) && 
            fontSize > minFontSize) {
        fontSize--;
        textarea.style.fontSize = `${fontSize}px`;
    }

    // Ajustamos la altura para centrar verticalmente
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, containerHeight)}px`;
}

// Modificar la función addLabel para incluir el observer
function addLabel(productName, imgSrc, qrData, index) {
    // ... resto del código existente ...

    const nameTextarea = document.createElement('textarea');
    nameTextarea.value = productName;
    
    // Crear un observador para detectar cambios en el contenido
    const observer = new MutationObserver(() => {
        adjustFontSize(nameTextarea);
    });

    // Observar cambios en el valor del textarea
    observer.observe(nameTextarea, {
        attributes: true,
        characterData: true,
        subtree: true
    });

    // Eventos para el textarea
    nameTextarea.addEventListener('input', function() {
        adjustFontSize(this);
    });

    // Ajustar también cuando cambie el tamaño de la ventana
    window.addEventListener('resize', () => {
        adjustFontSize(nameTextarea);
    });

    // ... resto del código existente ...
}
// Función para procesar códigos manualmente
// Función para procesar códigos manualmente
// Función para procesar códigos manualmente
// Función para procesar códigos manualmente
async function processCodesManually() {
    const textarea = document.getElementById('codesInput');
    const text = textarea.value.trim();
    
    if (!text) {
        alert('Por favor, pega algunos códigos primero.');
        return;
    }

    // Extraer solo los códigos numéricos usando expresión regular
    const codesFound = text.match(/\d{13,14}/g) || [];
    
    if (codesFound.length === 0) {
        alert('No se encontraron códigos válidos de 13 o 14 dígitos.');
        return;
    }

    // Filtrar solo códigos válidos
    const validCodes = codesFound.filter(isValidCode);
    console.log('Códigos válidos encontrados:', validCodes.length);
    
    // Actualizar el número de etiquetas automáticamente según los códigos válidos
    const container = document.getElementById('labelsContainer');
    container.innerHTML = '';
    selectedLabels = [];
    
    // Generar exactamente el número de etiquetas necesarias
    validCodes.forEach((code, index) => {
        // Crear la etiqueta
        addLabel('', 'https://via.placeholder.com/150', '', index);
        
        // Generar el código QR
        const qr = qrcode(0, 'L');
        qr.addData(code);
        qr.make();
        
        // Actualizar la etiqueta con el QR
        if (selectedLabels[index]) {
            selectedLabels[index].qrImg.src = qr.createDataURL(4, 0);
        }
    });
    
    // Actualizar los inputs de códigos
    generateCodeInputs(validCodes.length);
    
    // Llenar los inputs con los códigos
    validCodes.forEach((code, index) => {
        const input = document.getElementById(`qrCode${index + 1}`);
        if (input) {
            input.value = code;
        }
    });

    // Actualizar el contador de etiquetas en la interfaz
    document.getElementById('labelCount').value = validCodes.length;
    
    // Mantener solo los códigos válidos en el textarea
    textarea.value = validCodes.join('\n');
    
    console.log('Procesamiento completado. Etiquetas generadas:', validCodes.length);
}

// Función para actualizar el tamaño de las etiquetas
function updateLabelSize() {
    const widthMm = parseFloat(document.getElementById('labelWidth').value);
    const heightMm = parseFloat(document.getElementById('labelHeight').value);
    
    if (!validateDimensions(widthMm, heightMm)) return;
    
    const widthPx = mmToPx(widthMm);
    const heightPx = mmToPx(heightMm);
    
    if (widthPx && heightPx) {
        document.documentElement.style.setProperty('--label-width', `${widthPx}px`);
        document.documentElement.style.setProperty('--label-height', `${heightPx}px`);
        document.documentElement.style.setProperty('--square-size', `${heightPx}px`);
        
        const container = document.getElementById('labelsContainer');
        container.style.gridTemplateColumns = `repeat(auto-fit, ${widthPx}px)`;
        
        selectedLabels.forEach(label => {
            const maxSize = heightPx - 4;
            label.imgElement.style.maxWidth = `${maxSize}px`;
            label.imgElement.style.maxHeight = `${maxSize}px`;
            label.qrImg.style.maxWidth = `${maxSize}px`;
            label.qrImg.style.maxHeight = `${maxSize}px`;
        });
    }
}
// Función para generar inputs de códigos QR
// Función para generar inputs de códigos QR
function generateCodeInputs(count) {
    const codesGrid = document.getElementById('codesGrid');
    codesGrid.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'code-input-container';
        
        // Crear etiqueta con número
        const numberLabel = document.createElement('div');
        numberLabel.className = 'code-number';
        numberLabel.textContent = `${i}`;
        
        // Crear input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'code-input';
        input.id = `qrCode${i}`;
        input.placeholder = `Código QR ${i}`;
        
        // Contenedor para los botones
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        // Crear botón de búsqueda
        const searchButton = document.createElement('button');
        searchButton.className = 'search-button';
        searchButton.innerHTML = '<i class="fas fa-search"></i>';
        searchButton.title = 'Buscar código';
        searchButton.onclick = () => {
            const code = input.value.trim();
            if (code) {
                const imageSearchUrl = `https://www.google.com/search?q=${code}&tbm=isch&lr=lang_es`;
                const webSearchUrl = `https://www.google.com/search?q=${code}&lr=lang_es`;
                window.open(imageSearchUrl, '_blank');
                window.open(webSearchUrl, '_blank');
            }
        };

        // Crear botón de copiar
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i class="far fa-copy"></i>';
        copyButton.title = 'Copiar código';
        copyButton.onclick = async () => {
            const code = input.value.trim();
            if (code) {
                try {
                    await navigator.clipboard.writeText(code);
                    // Feedback visual temporal
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="far fa-copy"></i>';
                    }, 1000);
                } catch (err) {
                    console.error('Error al copiar:', err);
                }
            }
        };
        
        // Eventos para el input
        inputContainer.addEventListener('mouseenter', () => handleHighlight(i - 1, true));
        inputContainer.addEventListener('mouseleave', () => handleHighlight(i - 1, false));
        
        input.addEventListener('input', (e) => {
            const code = cleanCode(e.target.value);
            if (code.length > 0 && !isValidCode(code)) {
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
                if (isValidCode(code)) {
                    updateQRCode(i - 1, code);
                }
            }
        });
        
        // Agregar elementos al contenedor
        buttonContainer.appendChild(copyButton);
        buttonContainer.appendChild(searchButton);
        
        inputContainer.appendChild(numberLabel);
        inputContainer.appendChild(input);
        inputContainer.appendChild(buttonContainer);
        codesGrid.appendChild(inputContainer);
    }
}
// Función para actualizar el número de etiquetas
function updateLabelCount() {
    const count = parseInt(document.getElementById('labelCount').value) || 20;
    if (count < 1) {
        alert('El número de etiquetas debe ser mayor que 0');
        document.getElementById('labelCount').value = 1;
        return;
    }
    
    const container = document.getElementById('labelsContainer');
    container.innerHTML = '';
    selectedLabels = [];
    
    for (let i = 0; i < count; i++) {
        addLabel('', 'https://via.placeholder.com/150', '', i);
    }
    
    generateCodeInputs(count);
}

// Función para añadir una etiqueta
function addLabel(productName, imgSrc, qrData, index) {
    const labelRow = document.createElement('div');
    labelRow.classList.add('label-row');

    const labelNumber = document.createElement('div');
    labelNumber.classList.add('label-number');
    labelNumber.textContent = (index + 1).toString();
    labelRow.appendChild(labelNumber);

    const productCell = document.createElement('div');
    productCell.classList.add('product-cell');
    const productImg = document.createElement('img');
    productImg.src = imgSrc;
    productCell.appendChild(productImg);

    handleDragEvents(productCell, productImg);

    const nameCell = document.createElement('div');
    nameCell.classList.add('name-cell');
    const nameTextarea = document.createElement('textarea');
    nameTextarea.value = productName;
    nameTextarea.addEventListener('input', function() {
        adjustFontSize(this);
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, this.parentElement.offsetHeight - 4) + 'px';
    });
    nameCell.appendChild(nameTextarea);

    const qrCell = document.createElement('div');
    qrCell.classList.add('qr-cell');
    const qrImg = document.createElement('img');
    qrImg.src = qrData;
    qrCell.appendChild(qrImg);

    labelRow.appendChild(productCell);
    labelRow.appendChild(nameCell);
    labelRow.appendChild(qrCell);

    document.getElementById('labelsContainer').appendChild(labelRow);
    selectedLabels.push({
        imgElement: productImg,
        nameInput: nameTextarea,
        qrImg,
        row: labelRow
    });
}
// Función para actualizar código QR
function updateQRCode(index, text) {
    if (!text.trim() || !isValidCode(text)) return;
    
    const qr = qrcode(0, 'L');
    qr.addData(text);
    qr.make();
    
    if (selectedLabels[index]) {
        selectedLabels[index].qrImg.src = qr.createDataURL(4, 0);
    }
}

// Manejar eventos de arrastrar y soltar
function handleDragEvents(productCell, productImg) {
    productCell.addEventListener('dragover', (e) => {
        e.preventDefault();
        productCell.classList.add('dragover');
    });

    productCell.addEventListener('dragleave', () => {
        productCell.classList.remove('dragover');
    });

    productCell.addEventListener('drop', (e) => {
        e.preventDefault();
        productCell.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0 && e.dataTransfer.files[0].type.startsWith('image/')) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                productImg.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else if (e.dataTransfer.getData('text').includes('data:image') || 
                 e.dataTransfer.getData('text').includes('http')) {
            productImg.src = e.dataTransfer.getData('text');
        }
    });
}

// Función para limpiar todo
function clearAll() {
    document.querySelectorAll('.code-input').forEach(input => {
        input.value = '';
        input.classList.remove('invalid');
    });

    selectedLabels.forEach(label => {
        label.imgElement.src = 'https://via.placeholder.com/150';
        label.nameInput.value = '';
        label.qrImg.src = '';
    });
    
    // Limpiar el textarea
    document.getElementById('codesInput').value = '';
}
function printLabels() {
    // Configurar opciones de impresión
    const printWindow = window.open('', '_blank');
    
    // Crear el contenido de la página de impresión
    let printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Etiquetas QR</title>
            <style>
                @page {
                    size: letter;
                    margin: 0.5cm;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
                .labels-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, ${getComputedStyle(document.documentElement).getPropertyValue('--label-width')});
                    gap: 2mm;
                    padding: 0;
                }
                .label-row {
                    page-break-inside: avoid;
                    break-inside: avoid;
                    display: grid;
                    grid-template-columns: ${getComputedStyle(document.documentElement).getPropertyValue('--square-size')} 1fr ${getComputedStyle(document.documentElement).getPropertyValue('--square-size')};
                    border: 1px solid black;
                    margin-bottom: 2mm;
                }
                .product-cell, .qr-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2px;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <div class="labels-container">
                ${document.getElementById('labelsContainer').innerHTML}
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Esperar a que los recursos se carguen antes de imprimir
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
}
// Inicialización cuando el documento está listo
// Inicialización cuando el documento está listo
document.addEventListener('DOMContentLoaded', () => {
    const initialWidthMm = 100;
    const initialHeightMm = 25;
    
    document.getElementById('labelWidth').value = initialWidthMm;
    document.getElementById('labelHeight').value = initialHeightMm;
    
    updateLabelSize();
    updateLabelCount();

    // Event listener para el botón de impresión
    const printButton = document.getElementById('printButton');
    if (printButton) {
        printButton.addEventListener('click', () => {
            window.print();
        });
    } else {
        console.error('No se encontró el botón de impresión');
    }
});

// Alternativamente, puedes agregar esta función separada
function printLabels() {
    window.print();
}
