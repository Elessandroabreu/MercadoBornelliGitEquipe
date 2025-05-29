package com.mercadobornelli.controller;

import com.mercadobornelli.dto.FuncionarioDTO;
import com.mercadobornelli.model.Funcionario;
import com.mercadobornelli.service.FuncionarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FuncionarioController {

    @Autowired
    private FuncionarioService funcionarioService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FuncionarioDTO>> listarTodos() {
        List<FuncionarioDTO> funcionarios = funcionarioService.listarTodos();
        return ResponseEntity.ok(funcionarios);
    }

    @GetMapping("/excluidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FuncionarioDTO>> listarExcluidos() {
        List<FuncionarioDTO> funcionarios = funcionarioService.listarExcluidos();
        return ResponseEntity.ok(funcionarios);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FuncionarioDTO> buscarPorId(@PathVariable Long id) {
        FuncionarioDTO funcionario = funcionarioService.buscarPorId(id);
        return ResponseEntity.ok(funcionario);
    }

    @GetMapping("/cpf/{cpf}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FuncionarioDTO> buscarPorCpf(@PathVariable String cpf) {
        FuncionarioDTO funcionario = funcionarioService.buscarPorCpf(cpf);
        return ResponseEntity.ok(funcionario);
    }

    @GetMapping("/nome/{nome}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FuncionarioDTO>> buscarPorNome(@PathVariable String nome) {
        List<FuncionarioDTO> funcionarios = funcionarioService.buscarPorNome(nome);
        return ResponseEntity.ok(funcionarios);
    }

    @GetMapping("/cargo/{cargo}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FuncionarioDTO>> buscarPorCargo(@PathVariable Funcionario.Cargo cargo) {
        List<FuncionarioDTO> funcionarios = funcionarioService.buscarPorCargo(cargo);
        return ResponseEntity.ok(funcionarios);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FuncionarioDTO>> buscarPorStatus(@PathVariable Funcionario.Status status) {
        List<FuncionarioDTO> funcionarios = funcionarioService.buscarPorStatus(status);
        return ResponseEntity.ok(funcionarios);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FuncionarioDTO> salvar(@Valid @RequestBody FuncionarioDTO funcionarioDTO) {
        FuncionarioDTO novoFuncionario = funcionarioService.salvar(funcionarioDTO);
        return ResponseEntity.ok(novoFuncionario);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FuncionarioDTO> atualizar(@PathVariable Long id, @Valid @RequestBody FuncionarioDTO funcionarioDTO) {
        FuncionarioDTO funcionarioAtualizado = funcionarioService.atualizar(id, funcionarioDTO);
        return ResponseEntity.ok(funcionarioAtualizado);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        funcionarioService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restaurar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restaurar(@PathVariable Long id) {
        funcionarioService.restaurar(id);
        return ResponseEntity.noContent().build();
    }
}