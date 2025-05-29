package com.mercadobornelli.controller;

import com.mercadobornelli.dto.FornecedorDTO;
import com.mercadobornelli.dto.ProdutoDTO;
import com.mercadobornelli.service.FornecedorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fornecedores")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FornecedorController {

    @Autowired
    private FornecedorService fornecedorService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<FornecedorDTO>> listarTodos() {
        List<FornecedorDTO> fornecedores = fornecedorService.listarTodos();
        return ResponseEntity.ok(fornecedores);
    }

    @GetMapping("/excluidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FornecedorDTO>> listarExcluidos() {
        List<FornecedorDTO> fornecedores = fornecedorService.listarExcluidos();
        return ResponseEntity.ok(fornecedores);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<FornecedorDTO> buscarPorId(@PathVariable Long id) {
        FornecedorDTO fornecedor = fornecedorService.buscarPorId(id);
        return ResponseEntity.ok(fornecedor);
    }

    @GetMapping("/cnpj")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<FornecedorDTO> buscarPorCnpj(@RequestParam String cnpj) {
        FornecedorDTO fornecedor = fornecedorService.buscarPorCnpj(cnpj);
        return ResponseEntity.ok(fornecedor);
    }

    @GetMapping("/cnpj-numerico/{cnpj}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<FornecedorDTO> buscarPorCnpjNumerico(@PathVariable String cnpj) {
        // Formatar o CNPJ numérico para o formato XX.XXX.XXX/XXXX-XX
        String cnpjFormatado = formatarCnpj(cnpj);
        FornecedorDTO fornecedor = fornecedorService.buscarPorCnpj(cnpjFormatado);
        return ResponseEntity.ok(fornecedor);
    }

    private String formatarCnpj(String cnpj) {
        if (cnpj.length() != 14) {
            return cnpj; // Retorna como está se não tiver exatamente 14 dígitos
        }

        return cnpj.substring(0, 2) + "." +
                cnpj.substring(2, 5) + "." +
                cnpj.substring(5, 8) + "/" +
                cnpj.substring(8, 12) + "-" +
                cnpj.substring(12, 14);
    }

    @GetMapping("/nome/{nome}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<FornecedorDTO>> buscarPorNome(@PathVariable String nome) {
        List<FornecedorDTO> fornecedores = fornecedorService.buscarPorNome(nome);
        return ResponseEntity.ok(fornecedores);
    }

    @GetMapping("/{id}/produtos")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProdutoDTO>> listarProdutos(@PathVariable Long id) {
        List<ProdutoDTO> produtos = fornecedorService.listarProdutos(id);
        return ResponseEntity.ok(produtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FornecedorDTO> salvar(@Valid @RequestBody FornecedorDTO fornecedorDTO) {
        FornecedorDTO novoFornecedor = fornecedorService.salvar(fornecedorDTO);
        return ResponseEntity.ok(novoFornecedor);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FornecedorDTO> atualizar(@PathVariable Long id, @Valid @RequestBody FornecedorDTO fornecedorDTO) {
        FornecedorDTO fornecedorAtualizado = fornecedorService.atualizar(id, fornecedorDTO);
        return ResponseEntity.ok(fornecedorAtualizado);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        fornecedorService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restaurar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restaurar(@PathVariable Long id) {
        fornecedorService.restaurar(id);
        return ResponseEntity.noContent().build();
    }
}