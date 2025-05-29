document.addEventListener('DOMContentLoaded', () => {
  const barcodeForm = document.getElementById('barcode-form');
  const barcodeInput = document.getElementById('barcode-input');
  const scanAgainButton = document.getElementById('scan-again');
  const tryAgainButton = document.getElementById('try-again');
  const resultContainer = document.getElementById('result-container');
  const errorContainer = document.getElementById('error-container');
  const errorMessage = document.getElementById('error-message');
  const productName = document.getElementById('product-name');
  const productCategory = document.getElementById('product-category');
  const productPrice = document.getElementById('product-price');

  const fetchProductInfo = async (barcode) => {
    try {
      const product = await apiService.get(API.consulta.produto(barcode));
      displayProductInfo(product);
    } catch (error) {
      showError(`Produto não encontrado. Verifique o código de barras e tente novamente.`);
    }
  };

  const displayProductInfo = (product) => {
    productName.textContent = product.nomeProduto;
    productCategory.textContent = product.categoria || 'Categoria não especificada';
    productPrice.textContent = `R$ ${product.precoVenda.toFixed(2)}`;
    
    resultContainer.classList.remove('hidden');
  };

  const showError = (message) => {
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
  };

  const resetForm = () => {
    barcodeInput.value = '';
    barcodeInput.focus();
    resultContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
  };

  // Lidar com o envio do formulário
  barcodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const barcode = barcodeInput.value.trim();
    
    if (!barcode) {
      showError('Por favor, digite um código de barras válido.');
      return;
    }
    
    fetchProductInfo(barcode);
  });

  scanAgainButton.addEventListener('click', resetForm);
  tryAgainButton.addEventListener('click', resetForm);

  // Foco no input de código de barras quando a página carrega
  barcodeInput.focus();
});