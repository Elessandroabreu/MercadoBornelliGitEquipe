package com.mercadobornelli.controller;

import com.mercadobornelli.dto.ProdutoDTO;
import com.mercadobornelli.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consulta")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConsultaController {

    @Autowired
    private ProdutoService produtoService;

    @GetMapping("/produto/{codigo}")
    public ResponseEntity<ProdutoDTO> consultarProduto(@PathVariable String codigo) {
        ProdutoDTO produto = produtoService.buscarPorCodigoBarras(codigo);
        return ResponseEntity.ok(produto);
    }
}