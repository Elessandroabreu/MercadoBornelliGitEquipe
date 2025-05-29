package com.mercadobornelli.service;

import com.mercadobornelli.dto.ProdutoDTO;
import com.mercadobornelli.exception.ResourceNotFoundException;
import com.mercadobornelli.model.Fornecedor;
import com.mercadobornelli.model.Produto;
import com.mercadobornelli.repository.FornecedorRepository;
import com.mercadobornelli.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @Transactional(readOnly = true)
    public List<ProdutoDTO> listarTodos() {
        return produtoRepository.findAllAtivos().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProdutoDTO> listarExcluidos() {
        return produtoRepository.findAllExcluidos().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProdutoDTO buscarPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o id: " + id));

        if (produto.isExcluido()) {
            throw new ResourceNotFoundException("Produto não encontrado ou foi excluído.");
        }

        return converterParaDTO(produto);
    }

    @Transactional(readOnly = true)
    public ProdutoDTO buscarPorCodigoBarras(String codigo) {
        Produto produto = produtoRepository.findByCodigoBarras(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o código de barras: " + codigo));

        return converterParaDTO(produto);
    }

    @Transactional(readOnly = true)
    public List<ProdutoDTO> buscarPorNome(String nome) {
        return produtoRepository.findByNomeContainingIgnoreCase(nome).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProdutoDTO> buscarPorCategoria(String categoria) {
        return produtoRepository.findByCategoria(categoria).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProdutoDTO> buscarPorFornecedor(Long idFornecedor) {
        return produtoRepository.findByFornecedor(idFornecedor).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProdutoDTO> buscarPorEstoqueBaixo(Integer quantidade) {
        return produtoRepository.findByEstoqueBaixo(quantidade).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProdutoDTO salvar(ProdutoDTO produtoDTO) {
        // Verificar se o código de barras já existe
        produtoRepository.findByCodigoBarras(produtoDTO.getCodigoBarras())
                .ifPresent(p -> {
                    if (!p.getIdProduto().equals(produtoDTO.getIdProduto())) {
                        throw new IllegalArgumentException("Código de barras já cadastrado.");
                    }
                });

        Produto produto = converterParaEntidade(produtoDTO);
        produto = produtoRepository.save(produto);

        return converterParaDTO(produto);
    }

    @Transactional
    public ProdutoDTO atualizar(Long id, ProdutoDTO produtoDTO) {
        Produto produtoExistente = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o id: " + id));

        if (produtoExistente.isExcluido()) {
            throw new ResourceNotFoundException("Produto não encontrado ou foi excluído.");
        }

        // Atualizar campos
        produtoExistente.setNomeProduto(produtoDTO.getNomeProduto());
        produtoExistente.setCodigoBarras(produtoDTO.getCodigoBarras());
        produtoExistente.setCategoria(produtoDTO.getCategoria());
        produtoExistente.setQuantidadeEstoque(produtoDTO.getQuantidadeEstoque());
        produtoExistente.setPrecoCompra(produtoDTO.getPrecoCompra());
        produtoExistente.setPrecoVenda(produtoDTO.getPrecoVenda());

        // Atualizar o fornecedor se informado
        if (produtoDTO.getIdFornecedor() != null) {
            Fornecedor fornecedor = fornecedorRepository.findById(produtoDTO.getIdFornecedor())
                    .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado com o id: " + produtoDTO.getIdFornecedor()));

            produtoExistente.setFornecedor(fornecedor);
        } else {
            produtoExistente.setFornecedor(null);
        }

        produtoExistente = produtoRepository.save(produtoExistente);

        return converterParaDTO(produtoExistente);
    }

    @Transactional
    public void atualizarEstoque(Long id, Integer quantidade) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o id: " + id));

        if (produto.isExcluido()) {
            throw new ResourceNotFoundException("Produto não encontrado ou foi excluído.");
        }

        // Verifica se a quantidade ficará negativa
        int novaQuantidade = produto.getQuantidadeEstoque() + quantidade;
        if (novaQuantidade < 0) {
            throw new IllegalArgumentException("Quantidade em estoque não pode ficar negativa.");
        }

        produtoRepository.atualizarEstoque(id, quantidade);
    }

    @Transactional
    public void excluir(Long id) {
        if (!produtoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Produto não encontrado com o id: " + id);
        }

        produtoRepository.softDelete(id);
    }

    @Transactional
    public void restaurar(Long id) {
        if (!produtoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Produto não encontrado com o id: " + id);
        }

        produtoRepository.restaurar(id);
    }

    // Métodos auxiliares
    private ProdutoDTO converterParaDTO(Produto produto) {
        ProdutoDTO dto = new ProdutoDTO(
                produto.getIdProduto(),
                produto.getNomeProduto(),
                produto.getCodigoBarras(),
                produto.getCategoria(),
                produto.getQuantidadeEstoque(),
                produto.getPrecoCompra(),
                produto.getPrecoVenda(),
                null,
                null
        );

        if (produto.getFornecedor() != null) {
            dto.setIdFornecedor(produto.getFornecedor().getIdFornecedor());
            dto.setNomeFornecedor(produto.getFornecedor().getNomeEmpresa());
        }

        return dto;
    }

    private Produto converterParaEntidade(ProdutoDTO dto) {
        Produto produto = new Produto();

        if (dto.getIdProduto() != null) {
            produto.setIdProduto(dto.getIdProduto());
        }

        produto.setNomeProduto(dto.getNomeProduto());
        produto.setCodigoBarras(dto.getCodigoBarras());
        produto.setCategoria(dto.getCategoria());
        produto.setQuantidadeEstoque(dto.getQuantidadeEstoque());
        produto.setPrecoCompra(dto.getPrecoCompra());
        produto.setPrecoVenda(dto.getPrecoVenda());

        if (dto.getIdFornecedor() != null) {
            Fornecedor fornecedor = fornecedorRepository.findById(dto.getIdFornecedor())
                    .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado com o id: " + dto.getIdFornecedor()));

            produto.setFornecedor(fornecedor);
        }

        return produto;
    }
}