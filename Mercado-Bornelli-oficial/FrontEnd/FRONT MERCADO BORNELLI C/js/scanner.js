// Arquivo: js/scanner.js

// Classe para controlar o scanner de código de barras
class BarcodeScanner {
  constructor(videoElement, onScanSuccess, onScanError) {
    this.videoElement = videoElement;
    this.onScanSuccess = onScanSuccess;
    this.onScanError = onScanError || console.error;
    this.stream = null;
    this.scanning = false;
    this.initScanner();
  }

  async initScanner() {
    try {
      this.scanner = await this.createScanner();
    } catch (error) {
      this.onScanError('Falha ao inicializar o scanner: ' + error.message);
    }
  }

  async createScanner() {
    if ('BarcodeDetector' in window) {
      return new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_39', 'code_128', 'qr_code', 'data_matrix', 'codabar'] });
    } else {
      await this.loadQuaggaScript();
      return null; // Using Quagga instead
    }
  }

  loadQuaggaScript() {
    return new Promise((resolve, reject) => {
      if (window.Quagga) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Falha ao carregar Quagga.js'));
      document.head.appendChild(script);
    });
  }

  async start() {
    if (this.scanning) return;
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      this.videoElement.srcObject = this.stream;
      this.videoElement.setAttribute('playsinline', true);
      
      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve();
        };
      });
      
      this.scanning = true;
      
      if (this.scanner) {
        this.scanWithBarcodeDetector();
      } else {
        this.scanWithQuagga();
      }
    } catch (error) {
      this.onScanError('Erro ao acessar a câmera: ' + error.message);
    }
  }

  stop() {
    this.scanning = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (!this.scanner && window.Quagga) {
      Quagga.stop();
    }
  }

  scanWithBarcodeDetector() {
    const scan = async () => {
      if (!this.scanning) return;
      
      try {
        const barcodes = await this.scanner.detect(this.videoElement);
        
        if (barcodes.length > 0) {
          this.onScanSuccess(barcodes[0].rawValue);
        }
        
        requestAnimationFrame(scan);
      } catch (error) {
        this.onScanError('Erro durante o escaneamento: ' + error.message);
        requestAnimationFrame(scan);
      }
    };
    
    requestAnimationFrame(scan);
  }

  scanWithQuagga() {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: this.videoElement,
        constraints: {
          facingMode: "environment"
        }
      },
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_128_reader",
          "codabar_reader"
        ]
      }
    }, (err) => {
      if (err) {
        this.onScanError('Erro ao inicializar Quagga: ' + err);
        return;
      }
      
      Quagga.start();
      
      Quagga.onDetected((result) => {
        if (this.scanning && result && result.codeResult) {
          this.onScanSuccess(result.codeResult.code);
        }
      });
    });
  }

  // Método para simular uma leitura (para testes e entrada manual)
  simulateScan(barcode) {
    if (this.onScanSuccess) {
      this.onScanSuccess(barcode);
    }
  }
}

// Inicializa o scanner quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  const videoElement = document.getElementById('scanner-video');
  const startScannerBtn = document.getElementById('start-scanner');
  const stopScannerBtn = document.getElementById('stop-scanner');
  
  // Adicionando campo de entrada manual para código de barras
  // Primeiro, vamos criar os elementos HTML necessários se não existirem
  let scannerSection = document.querySelector('.scanner-section');
  if (scannerSection) {
    // Verificar se o campo de entrada manual já existe
    if (!document.getElementById('barcode-form')) {
      // Criar o formulário e elementos de entrada manual
      const manualInputHTML = `
        <div class="manual-input-section">
          <form id="barcode-form">
            <div class="input-group">
              <input type="text" id="barcode-input" placeholder="Digite o código de barras" class="form-control">
              <button type="submit" class="btn btn-primary">Adicionar</button>
            </div>
          </form>
        </div>
      `;
      
      // Inserir o HTML após os controles do scanner
      const scannerControls = document.querySelector('.scanner-controls');
      if (scannerControls) {
        scannerControls.insertAdjacentHTML('afterend', manualInputHTML);
      }
    }
  }
  
  // Esta função será chamada quando um código de barras for detectado
  const handleBarcodeDetected = async (barcode) => {
    try {
      console.log("Código de barras detectado:", barcode);
      
      // Busca informações do produto pelo código de barras
      const product = await apiService.get(API.consulta.produto(barcode));
      
      // Adiciona o produto ao carrinho
      if (window.addToCart) {
        window.addToCart(product);
      } else {
        console.error("Função addToCart não encontrada no escopo global!");
      }
      
      // Limpa o campo de entrada, se existir
      const barcodeInput = document.getElementById('barcode-input');
      if (barcodeInput) {
        barcodeInput.value = '';
      }
    } catch (error) {
      console.error('Erro ao processar código de barras:', error);
      alert(`Produto não encontrado para o código: ${barcode}`);
    }
  };
  
  // Função para lidar com erros do scanner
  const handleScannerError = (errorMessage) => {
    console.error('Erro do scanner:', errorMessage);
    alert('Erro no scanner: ' + errorMessage);
  };
  
  // Cria a instância do scanner
  if (videoElement) {
    const scanner = new BarcodeScanner(videoElement, handleBarcodeDetected, handleScannerError);
    
    // Expõe o scanner globalmente para poder ser usado em outros scripts
    window.scanner = scanner;
    
    // Adicionar handler para o formulário de código de barras manual
    const barcodeForm = document.getElementById('barcode-form');
    if (barcodeForm) {
      barcodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const barcodeInput = document.getElementById('barcode-input');
        const barcode = barcodeInput.value.trim();
        
        if (barcode) {
          scanner.simulateScan(barcode);
        }
      });
    }
  }
});

// Atalhos de teclado para testes
document.addEventListener('keydown', (e) => {
  // Pressione números de 1 a 9 enquanto mantém Ctrl para simular escaneamentos de produtos de teste
  if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
    const index = parseInt(e.key) - 1;
    const testBarcodes = [
      '7891234567890', // Arroz
      '7899876543210', // Feijão
      '7890123456789', // Açúcar
      '7891230987654', // Café
      '7893214567890', // Refrigerante
      '7897654321098', // Leite
      '7894561230987', // Óleo
      '7895678901234', // Sabão
      '7899876501234'  // Água
    ];
    
    if (index < testBarcodes.length && window.scanner) {
      window.scanner.simulateScan(testBarcodes[index]);
      console.log(`Simulando leitura do código: ${testBarcodes[index]}`);
    }
  }
});