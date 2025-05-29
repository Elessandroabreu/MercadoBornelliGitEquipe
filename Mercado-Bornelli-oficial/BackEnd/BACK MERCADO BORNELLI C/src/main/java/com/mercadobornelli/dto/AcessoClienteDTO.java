package com.mercadobornelli.dto;

import java.time.LocalDateTime;

public class AcessoClienteDTO {

    private Long idAcesso;
    private Long idCliente;
    private String nomeCliente;
    private LocalDateTime dataHoraAcesso;
    private String acaoRealizada;
    private String ipDispositivo;


    public AcessoClienteDTO() {
    }

    public AcessoClienteDTO(Long idAcesso, Long idCliente, String nomeCliente, LocalDateTime dataHoraAcesso,
                            String acaoRealizada, String ipDispositivo) {
        this.idAcesso = idAcesso;
        this.idCliente = idCliente;
        this.nomeCliente = nomeCliente;
        this.dataHoraAcesso = dataHoraAcesso;
        this.acaoRealizada = acaoRealizada;
        this.ipDispositivo = ipDispositivo;
    }


    public Long getIdAcesso() {
        return idAcesso;
    }

    public void setIdAcesso(Long idAcesso) {
        this.idAcesso = idAcesso;
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