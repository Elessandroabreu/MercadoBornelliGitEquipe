package com.mercadobornelli.dto;

import com.mercadobornelli.model.Venda;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class VendaDTO {

    private Long idVenda;
    private LocalDateTime dataVenda;
    private Long idCliente;
    private String nomeCliente;

    @NotNull(message = "Forma de pagamento é obrigatória")
    private Venda.FormaPagamento formaPagamento;

    private BigDecimal valorTotal;

    @NotEmpty(message = "A venda deve ter pelo menos um item")
    @Valid
    private List<ItemVendaDTO> itens = new ArrayList<>();

    // Construtores
    public VendaDTO() {
    }

    public VendaDTO(Long idVenda, LocalDateTime dataVenda, Long idCliente, String nomeCliente,
                    Venda.FormaPagamento formaPagamento, BigDecimal valorTotal) {
        this.idVenda = idVenda;
        this.dataVenda = dataVenda;
        this.idCliente = idCliente;
        this.nomeCliente = nomeCliente;
        this.formaPagamento = formaPagamento;
        this.valorTotal = valorTotal;
    }

    // Métodos helper
    public void calcularValorTotal() {
        this.valorTotal = itens.stream()
                .map(ItemVendaDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void adicionarItem(ItemVendaDTO item) {
        itens.add(item);
        calcularValorTotal();
    }

    // Getters e Setters
    public Long getIdVenda() {
        return idVenda;
    }

    public void setIdVenda(Long idVenda) {
        this.idVenda = idVenda;
    }

    public LocalDateTime getDataVenda() {
        return dataVenda;
    }

    public void setDataVenda(LocalDateTime dataVenda) {
        this.dataVenda = dataVenda;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public Venda.FormaPagamento getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(Venda.FormaPagamento formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public List<ItemVendaDTO> getItens() {
        return itens;
    }

    public void setItens(List<ItemVendaDTO> itens) {
        this.itens = itens;
        calcularValorTotal();
    }
}