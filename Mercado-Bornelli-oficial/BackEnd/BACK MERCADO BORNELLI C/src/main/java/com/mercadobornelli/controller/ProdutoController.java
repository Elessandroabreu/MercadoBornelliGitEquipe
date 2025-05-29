package com.mercadobornelli.controller;

import com.mercadobornelli.dto.ProdutoDTO;
import com.mercadobornelli.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProdutoDTO>> listarTodos() {
        List<ProdutoDTO> produtos = produtoService.listarTodos();
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/excluidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProdutoDTO>> listarExcluidos() {
        List<ProdutoDTO> produtos = produtoService.listarExcluidos();
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ProdutoDTO> buscarPorId(@PathVariable Long id) {
        ProdutoDTO produto = produtoService.buscarPorId(id);
        return ResponseEntity.ok(produto);
    }

    @GetMapping("/codigo-barras/{codigo}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ProdutoDTO> buscarPorCodigoBarras(@PathVariable String codigo) {
        ProdutoDTO produto = produtoService.buscarPorCodigoBarras(codigo);
        return ResponseEntity.ok(produto);
    }

    @GetMapping("/nome/{nome}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProdutoDTO>> buscarPorNome(@PathVariable String nome) {
        List<ProdutoDTO> produtos = produtoService.buscarPorNome(nome);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/categoria/{categoria}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProdutoDTO>> buscarPorCategoria(@PathVariable String categoria) {
        List<ProdutoDTO> produtos = produtoService.buscarPorCategoria(categoria);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/estoque-baixo/{quantidade}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProdutoDTO>> buscarPorEstoqueBaixo(@PathVariable Integer quantidade) {
        List<ProdutoDTO> produtos = produtoService.buscarPorEstoqueBaixo(quantidade);
        return ResponseEntity.ok(produtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProdutoDTO> salvar(@Valid @RequestBody ProdutoDTO produtoDTO) {
        ProdutoDTO novoProduto = produtoService.salvar(produtoDTO);
        return ResponseEntity.ok(novoProduto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProdutoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoDTO produtoDTO) {
        ProdutoDTO produtoAtualizado = produtoService.atualizar(id, produtoDTO);
        return ResponseEntity.ok(produtoAtualizado);
    }

    @PatchMapping("/{id}/estoque/{quantidade}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> atualizarEstoque(@PathVariable Long id, @PathVariable Integer quantidade) {
        produtoService.atualizarEstoque(id, quantidade);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        produtoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restaurar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restaurar(@PathVariable Long id) {
        produtoService.restaurar(id);
        return ResponseEntity.noContent().build();
    }
}