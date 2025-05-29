package com.mercadobornelli.controller;

import com.mercadobornelli.dto.FeedbackDTO;
import com.mercadobornelli.dto.FornecedorDTO;
import com.mercadobornelli.dto.ProdutoDTO;
import com.mercadobornelli.dto.VendaDTO;
import com.mercadobornelli.exception.ResourceNotFoundException;
import com.mercadobornelli.service.FeedbackService;
import com.mercadobornelli.service.FornecedorService;
import com.mercadobornelli.service.ProdutoService;
import com.mercadobornelli.service.VendaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/totem")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TotemController {

    @Autowired
    private FornecedorService fornecedorService;

    @Autowired
    private ProdutoService produtoService;

    @Autowired
    private VendaService vendaService;

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/fornecedores/cnpj/{cnpj}")
    public ResponseEntity<Object> buscarFornecedorPorCnpj(@PathVariable String cnpj) {
        try {
            FornecedorDTO fornecedor = fornecedorService.buscarPorCnpj(cnpj);
            return ResponseEntity.ok(fornecedor);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Log detalhado da exceção
            System.err.println("Erro ao buscar fornecedor por CNPJ: " + cnpj);
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao buscar fornecedor: " + e.getMessage());
        }
    }

    @GetMapping("/produtos")
    public ResponseEntity<List<ProdutoDTO>> listarProdutos() {
        List<ProdutoDTO> produtos = produtoService.listarTodos();
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/produtos/{codigo}")
    public ResponseEntity<ProdutoDTO> buscarProduto(@PathVariable String codigo) {
        ProdutoDTO produto = produtoService.buscarPorCodigoBarras(codigo);
        return ResponseEntity.ok(produto);
    }

    @GetMapping("/produtos/categoria/{categoria}")
    public ResponseEntity<List<ProdutoDTO>> buscarProdutosPorCategoria(@PathVariable String categoria) {
        List<ProdutoDTO> produtos = produtoService.buscarPorCategoria(categoria);
        return ResponseEntity.ok(produtos);
    }

    @PostMapping("/vendas")
    public ResponseEntity<VendaDTO> realizarVenda(@RequestBody VendaDTO vendaDTO) {
        try {
            // Debug: imprime o que recebemos
            System.out.println("Recebido vendaDTO com valorTotal: " + vendaDTO.getValorTotal());

            // Garantindo que temos itens para evitar NullPointerException
            if (vendaDTO.getItens() == null || vendaDTO.getItens().isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }

            // Recalcula o valor total com base nos itens
            vendaDTO.calcularValorTotal();
            System.out.println("Valor total recalculado: " + vendaDTO.getValorTotal());

            // Verificar se o valorTotal ainda está null após recalcular
            if (vendaDTO.getValorTotal() == null) {
                // Se ainda estiver null, calculamos manualmente
                BigDecimal total = BigDecimal.ZERO;
                for (int i = 0; i < vendaDTO.getItens().size(); i++) {
                    BigDecimal subtotal = vendaDTO.getItens().get(i).getSubtotal();
                    if (subtotal != null) {
                        total = total.add(subtotal);
                    }
                }
                vendaDTO.setValorTotal(total);
                System.out.println("Valor total definido manualmente: " + vendaDTO.getValorTotal());
            }


            VendaDTO venda = vendaService.salvar(vendaDTO);
            return ResponseEntity.ok(venda);
        } catch (Exception e) {
            System.err.println("Erro ao processar venda: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-lança para tratamento global
        }
    }

    @PostMapping("/feedbacks")
    public ResponseEntity<FeedbackDTO> registrarFeedback(@Valid @RequestBody FeedbackDTO feedbackDTO) {
        FeedbackDTO feedback = feedbackService.salvar(feedbackDTO);
        return ResponseEntity.ok(feedback);
    }
}