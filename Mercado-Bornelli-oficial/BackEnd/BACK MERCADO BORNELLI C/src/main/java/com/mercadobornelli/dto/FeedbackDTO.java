package com.mercadobornelli.dto;

import com.mercadobornelli.model.Feedback;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class FeedbackDTO {

    private Long idFeedback;
    private Long idCliente;
    private String nomeCliente;
    private String cpfCliente;
    private String telefoneCliente;
    private Long idVenda;

    @NotNull(message = "Tipo de feedback é obrigatório")
    private Feedback.TipoFeedback tipo;

    @NotNull(message = "Nota é obrigatória")
    @Min(value = 1, message = "Nota deve ser entre 1 e 5")
    @Max(value = 5, message = "Nota deve ser entre 1 e 5")
    private Integer nota;

    private String comentario;
    private LocalDateTime dataFeedback;


    public FeedbackDTO() {
    }

    public FeedbackDTO(Long idFeedback, Long idCliente, String nomeCliente, String cpfCliente, String telefoneCliente,
                       Long idVenda, Feedback.TipoFeedback tipo, Integer nota, String comentario, LocalDateTime dataFeedback) {
        this.idFeedback = idFeedback;
        this.idCliente = idCliente;
        this.nomeCliente = nomeCliente;
        this.cpfCliente = cpfCliente;
        this.telefoneCliente = telefoneCliente;
        this.idVenda = idVenda;
        this.tipo = tipo;
        this.nota = nota;
        this.comentario = comentario;
        this.dataFeedback = dataFeedback;
    }


    public Long getIdFeedback() {
        return idFeedback;
    }

    public void setIdFeedback(Long idFeedback) {
        this.idFeedback = idFeedback;
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

    public String getCpfCliente() {
        return cpfCliente;
    }

    public void setCpfCliente(String cpfCliente) {
        this.cpfCliente = cpfCliente;
    }

    public String getTelefoneCliente() {
        return telefoneCliente;
    }

    public void setTelefoneCliente(String telefoneCliente) {
        this.telefoneCliente = telefoneCliente;
    }

    public Long getIdVenda() {
        return idVenda;
    }

    public void setIdVenda(Long idVenda) {
        this.idVenda = idVenda;
    }

    public Feedback.TipoFeedback getTipo() {
        return tipo;
    }

    public void setTipo(Feedback.TipoFeedback tipo) {
        this.tipo = tipo;
    }

    public Integer getNota() {
        return nota;
    }

    public void setNota(Integer nota) {
        this.nota = nota;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getDataFeedback() {
        return dataFeedback;
    }

    public void setDataFeedback(LocalDateTime dataFeedback) {
        this.dataFeedback = dataFeedback;
    }
}