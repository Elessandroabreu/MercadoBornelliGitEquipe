package com.mercadobornelli.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class ProdutoDTO {

    private Long idProduto;

    @NotBlank(message = "Nome do produto é obrigatório")
    private String nomeProduto;

    @NotBlank(message = "Código de barras é obrigatório")
    private String codigoBarras;

    private String categoria;

    @NotNull(message = "Quantidade em estoque é obrigatória")
    @PositiveOrZero(message = "Quantidade em estoque deve ser maior ou igual a zero")
    private Integer quantidadeEstoque;

    @NotNull(message = "Preço de compra é obrigatório")
    @Positive(message = "Preço de compra deve ser maior que zero")
    private BigDecimal precoCompra;

    @NotNull(message = "Preço de venda é obrigatório")
    @Positive(message = "Preço de venda deve ser maior que zero")
    private BigDecimal precoVenda;

    private Long idFornecedor;
    private String nomeFornecedor;

    // Construtores
    public ProdutoDTO() {
    }

    public ProdutoDTO(Long idProduto, String nomeProduto, String codigoBarras, String categoria, Integer quantidadeEstoque,
                      BigDecimal precoCompra, BigDecimal precoVenda, Long idFornecedor, String nomeFornecedor) {
        this.idProduto = idProduto;
        this.nomeProduto = nomeProduto;
        this.codigoBarras = codigoBarras;
        this.categoria = categoria;
        this.quantidadeEstoque = quantidadeEstoque;
        this.precoCompra = precoCompra;
        this.precoVenda = precoVenda;
        this.idFornecedor = idFornecedor;
        this.nomeFornecedor = nomeFornecedor;
    }

    // Getters e Setters
    public Long getIdProduto() {
        return idProduto;
    }

    public void setIdProduto(Long idProduto) {
        this.idProduto = idProduto;
    }

    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public String getCodigoBarras() {
        return codigoBarras;
    }

    public void setCodigoBarras(String codigoBarras) {
        this.codigoBarras = codigoBarras;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Integer getQuantidadeEstoque() {
        return quantidadeEstoque;
    }

    public void setQuantidadeEstoque(Integer quantidadeEstoque) {
        this.quantidadeEstoque = quantidadeEstoque;
    }

    public BigDecimal getPrecoCompra() {
        return precoCompra;
    }

    public void setPrecoCompra(BigDecimal precoCompra) {
        this.precoCompra = precoCompra;
    }

    public BigDecimal getPrecoVenda() {
        return precoVenda;
    }

    public void setPrecoVenda(BigDecimal precoVenda) {
        this.precoVenda = precoVenda;
    }

    public Long getIdFornecedor() {
        return idFornecedor;
    }

    public void setIdFornecedor(Long idFornecedor) {
        this.idFornecedor = idFornecedor;
    }

    public String getNomeFornecedor() {
        return nomeFornecedor;
    }

    public void setNomeFornecedor(String nomeFornecedor) {
        this.nomeFornecedor = nomeFornecedor;
    }
}