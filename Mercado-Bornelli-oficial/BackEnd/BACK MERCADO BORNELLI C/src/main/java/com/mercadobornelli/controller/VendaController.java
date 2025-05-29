package com.mercadobornelli.controller;

import com.mercadobornelli.dto.VendaDTO;
import com.mercadobornelli.service.VendaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendas")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VendaController {

    @Autowired
    private VendaService vendaService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<VendaDTO>> listarTodas() {
        List<VendaDTO> vendas = vendaService.listarTodas();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<VendaDTO> buscarPorId(@PathVariable Long id) {
        VendaDTO venda = vendaService.buscarPorId(id);
        return ResponseEntity.ok(venda);
    }

    @GetMapping("/cliente/{idCliente}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<VendaDTO>> buscarPorCliente(@PathVariable Long idCliente) {
        List<VendaDTO> vendas = vendaService.buscarPorCliente(idCliente);
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/periodo")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<VendaDTO>> buscarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<VendaDTO> vendas = vendaService.buscarPorPeriodo(inicio, fim);
        return ResponseEntity.ok(vendas);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<VendaDTO> salvar(@Valid @RequestBody VendaDTO vendaDTO) {
        VendaDTO novaVenda = vendaService.salvar(vendaDTO);
        return ResponseEntity.ok(novaVenda);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        vendaService.cancelar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/relatorio/personalizado")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> gerarRelatorioPersonalizado(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        Map<String, Object> relatorio = vendaService.gerarRelatorioPersonalizado(inicio, fim);
        return ResponseEntity.ok(relatorio);
    }

    @GetMapping("/relatorio/mensal")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> gerarRelatorioMensal(
            @RequestParam int ano,
            @RequestParam int mes) {
        Map<String, Object> relatorio = vendaService.gerarRelatorioMensal(ano, mes);
        return ResponseEntity.ok(relatorio);
    }

    @GetMapping("/relatorio/anual")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> gerarRelatorioAnual(@RequestParam int ano) {
        Map<String, Object> relatorio = vendaService.gerarRelatorioAnual(ano);
        return ResponseEntity.ok(relatorio);
    }
}