package com.mercadobornelli.service;

import com.mercadobornelli.dto.FuncionarioDTO;
import com.mercadobornelli.exception.ResourceNotFoundException;
import com.mercadobornelli.model.Funcionario;
import com.mercadobornelli.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuncionarioService {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Transactional(readOnly = true)
    public List<FuncionarioDTO> listarTodos() {

        return funcionarioRepository.findAllAtivos().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FuncionarioDTO> listarExcluidos() {
        return funcionarioRepository.findAllExcluidos().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FuncionarioDTO buscarPorId(Long id) {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado com o id: " + id));

        if (funcionario.isExcluido()) {
            throw new ResourceNotFoundException("Funcionário não encontrado ou foi excluído.");
        }

        return converterParaDTO(funcionario);
    }

    @Transactional(readOnly = true)
    public FuncionarioDTO buscarPorCpf(String cpf) {
        Funcionario funcionario = funcionarioRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado com o CPF: " + cpf));

        return converterParaDTO(funcionario);
    }

    @Transactional(readOnly = true)
    public List<FuncionarioDTO> buscarPorNome(String nome) {
        return funcionarioRepository.findByNomeContainingIgnoreCase(nome).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FuncionarioDTO> buscarPorCargo(Funcionario.Cargo cargo) {
        return funcionarioRepository.findByCargo(cargo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FuncionarioDTO> buscarPorStatus(Funcionario.Status status) {
        return funcionarioRepository.findByStatus(status).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FuncionarioDTO salvar(FuncionarioDTO funcionarioDTO) {
        // Verificar se o CPF já existe
        funcionarioRepository.findByCpf(funcionarioDTO.getCpf())
                .ifPresent(f -> {
                    if (!f.getIdFuncionario().equals(funcionarioDTO.getIdFuncionario())) {
                        throw new IllegalArgumentException("CPF já cadastrado.");
                    }
                });

        // Verificar se o email já existe e não é nulo
        if (funcionarioDTO.getEmail() != null && !funcionarioDTO.getEmail().isEmpty()) {
            funcionarioRepository.findByEmail(funcionarioDTO.getEmail())
                    .ifPresent(f -> {
                        if (!f.getIdFuncionario().equals(funcionarioDTO.getIdFuncionario())) {
                            throw new IllegalArgumentException("Email já cadastrado.");
                        }
                    });
        }

        Funcionario funcionario = converterParaEntidade(funcionarioDTO);
        funcionario = funcionarioRepository.save(funcionario);

        return converterParaDTO(funcionario);
    }

    @Transactional
    public FuncionarioDTO atualizar(Long id, FuncionarioDTO funcionarioDTO) {
        Funcionario funcionarioExistente = funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado com o id: " + id));

        if (funcionarioExistente.isExcluido()) {
            throw new ResourceNotFoundException("Funcionário não encontrado ou foi excluído.");
        }

        // Atualizar campos
        funcionarioExistente.setNomeCompleto(funcionarioDTO.getNomeCompleto());
        funcionarioExistente.setCpf(funcionarioDTO.getCpf());
        funcionarioExistente.setEmail(funcionarioDTO.getEmail());
        funcionarioExistente.setTelefone(funcionarioDTO.getTelefone());
        funcionarioExistente.setCargo(funcionarioDTO.getCargo());
        funcionarioExistente.setStatus(funcionarioDTO.getStatus());
        funcionarioExistente.setDataAdmissao(funcionarioDTO.getDataAdmissao());
        funcionarioExistente.setSalario(funcionarioDTO.getSalario());

        funcionarioExistente = funcionarioRepository.save(funcionarioExistente);

        return converterParaDTO(funcionarioExistente);
    }

    @Transactional
    public void excluir(Long id) {
        if (!funcionarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Funcionário não encontrado com o id: " + id);
        }

        funcionarioRepository.softDelete(id);
    }

    @Transactional
    public void restaurar(Long id) {
        if (!funcionarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Funcionário não encontrado com o id: " + id);
        }

        funcionarioRepository.restaurar(id);
    }

    // Métodos auxiliares
    private FuncionarioDTO converterParaDTO(Funcionario funcionario) {
        return new FuncionarioDTO(
                funcionario.getIdFuncionario(),
                funcionario.getNomeCompleto(),
                funcionario.getCpf(),
                funcionario.getEmail(),
                funcionario.getTelefone(),
                funcionario.getCargo(),
                funcionario.getStatus(),
                funcionario.getDataAdmissao(),
                funcionario.getSalario()
        );
    }

    private Funcionario converterParaEntidade(FuncionarioDTO dto) {
        Funcionario funcionario = new Funcionario();

        if (dto.getIdFuncionario() != null) {
            funcionario.setIdFuncionario(dto.getIdFuncionario());
        }

        funcionario.setNomeCompleto(dto.getNomeCompleto());
        funcionario.setCpf(dto.getCpf());
        funcionario.setEmail(dto.getEmail());
        funcionario.setTelefone(dto.getTelefone());
        funcionario.setCargo(dto.getCargo());
        funcionario.setStatus(dto.getStatus());
        funcionario.setDataAdmissao(dto.getDataAdmissao());
        funcionario.setSalario(dto.getSalario());

        return funcionario;
    }
}