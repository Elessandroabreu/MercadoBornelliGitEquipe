package com.mercadobornelli.service;

import com.mercadobornelli.dto.FornecedorDTO;
import com.mercadobornelli.dto.ProdutoDTO;
import com.mercadobornelli.exception.ResourceNotFoundException;
import com.mercadobornelli.model.Fornecedor;
import com.mercadobornelli.repository.FornecedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FornecedorService {

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @Autowired
    private ProdutoService produtoService;

    @Transactional(readOnly = true)
    public List<FornecedorDTO> listarTodos() {
        return fornecedorRepository.findAllAtivos().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FornecedorDTO> listarExcluidos() {
        return fornecedorRepository.findAllExcluidos().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FornecedorDTO buscarPorId(Long id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado com o id: " + id));

        if (fornecedor.isExcluido()) {
            throw new ResourceNotFoundException("Fornecedor não encontrado ou foi excluído.");
        }

        return converterParaDTO(fornecedor);
    }

    @Transactional(readOnly = true)
    public FornecedorDTO buscarPorCnpj(String cnpj) {
        // Tenta decodificar o CNPJ caso esteja codificado na URL
        try {
            cnpj = java.net.URLDecoder.decode(cnpj, "UTF-8");
        } catch (Exception e) {

        }

        // Salva o CNPJ decodificado em uma variável final para usar na expressão lambda
        final String finalCnpj = cnpj;

        Fornecedor fornecedor = fornecedorRepository.findByCnpj(cnpj)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado com o CNPJ: " + finalCnpj));

        return converterParaDTO(fornecedor);
    }
    @Transactional(readOnly = true)
    public List<FornecedorDTO> buscarPorNome(String nome) {
        return fornecedorRepository.findByNomeContainingIgnoreCase(nome).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FornecedorDTO salvar(FornecedorDTO fornecedorDTO) {
        // Verificar se o CNPJ já existe
        fornecedorRepository.findByCnpj(fornecedorDTO.getCnpj())
                .ifPresent(f -> {
                    if (!f.getIdFornecedor().equals(fornecedorDTO.getIdFornecedor())) {
                        throw new IllegalArgumentException("CNPJ já cadastrado.");
                    }
                });

        Fornecedor fornecedor = converterParaEntidade(fornecedorDTO);
        fornecedor = fornecedorRepository.save(fornecedor);

        return converterParaDTO(fornecedor);
    }

    @Transactional
    public FornecedorDTO atualizar(Long id, FornecedorDTO fornecedorDTO) {
        Fornecedor fornecedorExistente = fornecedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado com o id: " + id));

        if (fornecedorExistente.isExcluido()) {
            throw new ResourceNotFoundException("Fornecedor não encontrado ou foi excluído.");
        }

        // Atualizar campos
        fornecedorExistente.setNomeEmpresa(fornecedorDTO.getNomeEmpresa());
        fornecedorExistente.setCnpj(fornecedorDTO.getCnpj());
        fornecedorExistente.setNomeRepresentante(fornecedorDTO.getNomeRepresentante());
        fornecedorExistente.setTelefone(fornecedorDTO.getTelefone());
        fornecedorExistente.setEmail(fornecedorDTO.getEmail());
        fornecedorExistente.setProdutosFornecidos(fornecedorDTO.getProdutosFornecidos());

        fornecedorExistente = fornecedorRepository.save(fornecedorExistente);

        return converterParaDTO(fornecedorExistente);
    }

    @Transactional
    public void excluir(Long id) {
        if (!fornecedorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fornecedor não encontrado com o id: " + id);
        }

        // Verificar se há produtos associados a este fornecedor
        List<ProdutoDTO> produtos = produtoService.buscarPorFornecedor(id);
        if (!produtos.isEmpty()) {
            throw new IllegalStateException("Não é possível excluir o fornecedor pois existem produtos associados a ele.");
        }

        fornecedorRepository.softDelete(id);
    }

    @Transactional
    public void restaurar(Long id) {
        if (!fornecedorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fornecedor não encontrado com o id: " + id);
        }

        fornecedorRepository.restaurar(id);
    }

    @Transactional(readOnly = true)
    public List<ProdutoDTO> listarProdutos(Long idFornecedor) {
        if (!fornecedorRepository.existsById(idFornecedor)) {
            throw new ResourceNotFoundException("Fornecedor não encontrado com o id: " + idFornecedor);
        }

        return produtoService.buscarPorFornecedor(idFornecedor);
    }

    // Métodos auxiliares
    private FornecedorDTO converterParaDTO(Fornecedor fornecedor) {
        return new FornecedorDTO(
                fornecedor.getIdFornecedor(),
                fornecedor.getNomeEmpresa(),
                fornecedor.getCnpj(),
                fornecedor.getNomeRepresentante(),
                fornecedor.getTelefone(),
                fornecedor.getEmail(),
                fornecedor.getProdutosFornecidos()
        );
    }

    private Fornecedor converterParaEntidade(FornecedorDTO dto) {
        Fornecedor fornecedor = new Fornecedor();

        if (dto.getIdFornecedor() != null) {
            fornecedor.setIdFornecedor(dto.getIdFornecedor());
        }

        fornecedor.setNomeEmpresa(dto.getNomeEmpresa());
        fornecedor.setCnpj(dto.getCnpj());
        fornecedor.setNomeRepresentante(dto.getNomeRepresentante());
        fornecedor.setTelefone(dto.getTelefone());
        fornecedor.setEmail(dto.getEmail());
        fornecedor.setProdutosFornecidos(dto.getProdutosFornecidos());

        return fornecedor;
    }
}