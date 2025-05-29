package com.mercadobornelli.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_item_venda")
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item_venda")
    private Long idItemVenda;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "id_venda", nullable = false)
    private Venda venda;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto produto;

    @NotNull
    @Positive
    @Column(name = "qtd_produto", nullable = false)
    private Integer quantidade;

    @NotNull
    @Positive
    @Column(name = "vl_unitario", nullable = false)
    private BigDecimal precoUnitario;

    @NotNull
    @Positive
    @Column(name = "vl_subtotal", nullable = false)
    private BigDecimal subtotal;

    // Métodos helper
    @PrePersist
    @PreUpdate
    protected void calcularSubtotal() {
        this.subtotal = this.precoUnitario.multiply(BigDecimal.valueOf(this.quantidade));
    }


    public Long getIdItemVenda() {
        return idItemVenda;
    }

    public void setIdItemVenda(Long idItemVenda) {
        this.idItemVenda = idItemVenda;
    }

    public Venda getVenda() {
        return venda;
    }

    public void setVenda(Venda venda) {
        this.venda = venda;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
        if (this.precoUnitario != null) {
            calcularSubtotal();
        }
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(BigDecimal precoUnitario) {
        this.precoUnitario = precoUnitario;
        if (this.quantidade != null) {
            calcularSubtotal();
        }
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}