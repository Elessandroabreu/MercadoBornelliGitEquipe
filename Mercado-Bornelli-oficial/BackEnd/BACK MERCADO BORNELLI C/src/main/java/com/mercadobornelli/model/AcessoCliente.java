package com.mercadobornelli.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_acesso_cliente")
public class AcessoCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_acesso")
    private Long idAcesso;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @NotNull
    @Column(name = "dt_acesso", nullable = false)
    private LocalDateTime dataHoraAcesso;

    @Column(name = "acao_realizada")
    private String acaoRealizada;

    @Column(name = "ip_dispositivo")
    private String ipDispositivo;

    @PrePersist
    protected void onCreate() {
        dataHoraAcesso = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getIdAcesso() {
        return idAcesso;
    }

    public void setIdAcesso(Long idAcesso) {
        this.idAcesso = idAcesso;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public LocalDateTime getDataHoraAcesso() {
        return dataHoraAcesso;
    }

    public void setDataHoraAcesso(LocalDateTime dataHoraAcesso) {
        this.dataHoraAcesso = dataHoraAcesso;
    }

    public String getAcaoRealizada() {
        return acaoRealizada;
    }

    public void setAcaoRealizada(String acaoRealizada) {
        this.acaoRealizada = acaoRealizada;
    }

    public String getIpDispositivo() {
        return ipDispositivo;
    }

    public void setIpDispositivo(String ipDispositivo) {
        this.ipDispositivo = ipDispositivo;
    }
}