package com.mercadobornelli.controller;

import com.mercadobornelli.dto.ClienteDTO;
import com.mercadobornelli.dto.AcessoClienteDTO;
import com.mercadobornelli.service.ClienteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ClienteDTO>> listarTodos() {
        List<ClienteDTO> clientes = clienteService.listarTodos();
        return ResponseEntity.ok(clientes);
    }

    @GetMapping("/excluidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClienteDTO>> listarExcluidos() {
        List<ClienteDTO> clientes = clienteService.listarExcluidos();
        return ResponseEntity.ok(clientes);
    }


    @GetMapping("/periodo")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ClienteDTO>> buscarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {


        System.out.println("=== BUSCAR CLIENTES POR PERÍODO ===");
        System.out.println("Data início recebida: " + inicio);
        System.out.println("Data fim recebida: " + fim);

        try {
            List<ClienteDTO> clientes = clienteService.buscarPorPeriodo(inicio, fim);
            System.out.println("Clientes encontrados no período: " + clientes.size());

            // Se não encontrar nenhum cliente no período, retorna lista vazia (não todos os clientes)
            return ResponseEntity.ok(clientes);

        } catch (Exception e) {
            System.err.println("Erro ao buscar clientes por período: " + e.getMessage());
            e.printStackTrace();

            // Em caso de erro, retorna lista vazia em vez de todos os clientes
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }


    @GetMapping("/count-periodo")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Long> contarClientesPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {

        System.out.println("=== CONTAR CLIENTES POR PERÍODO ===");
        System.out.println("Data início: " + inicio);
        System.out.println("Data fim: " + fim);

        try {
            Long count = clienteService.contarClientesPorPeriodo(inicio, fim);
            System.out.println("Contagem de clientes: " + count);
            return ResponseEntity.ok(count != null ? count : 0L);
        } catch (Exception e) {
            System.err.println("Erro ao contar clientes por período: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(0L);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ClienteDTO> buscarPorId(@PathVariable Long id, HttpServletRequest request) {
        ClienteDTO cliente = clienteService.buscarPorId(id);
        clienteService.registrarAcesso(id, "Visualização de cliente", request);
        return ResponseEntity.ok(cliente);
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<ClienteDTO> buscarPorCpf(@PathVariable String cpf) {
        ClienteDTO cliente = clienteService.buscarPorCpf(cpf);
        return ResponseEntity.ok(cliente);
    }

    @GetMapping("/nome/{nome}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ClienteDTO>> buscarPorNome(@PathVariable String nome) {
        List<ClienteDTO> clientes = clienteService.buscarPorNome(nome);
        return ResponseEntity.ok(clientes);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ClienteDTO> salvar(@Valid @RequestBody ClienteDTO clienteDTO) {
        ClienteDTO novoCliente = clienteService.salvar(clienteDTO);
        return ResponseEntity.ok(novoCliente);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ClienteDTO> atualizar(@PathVariable Long id, @Valid @RequestBody ClienteDTO clienteDTO, HttpServletRequest request) {
        ClienteDTO clienteAtualizado = clienteService.atualizar(id, clienteDTO);
        clienteService.registrarAcesso(id, "Atualização de dados", request);
        return ResponseEntity.ok(clienteAtualizado);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        clienteService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restaurar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restaurar(@PathVariable Long id) {
        clienteService.restaurar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/acessos")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<AcessoClienteDTO>> listarAcessos(@PathVariable Long id) {
        List<AcessoClienteDTO> acessos = clienteService.listarAcessos(id);
        return ResponseEntity.ok(acessos);
    }
}