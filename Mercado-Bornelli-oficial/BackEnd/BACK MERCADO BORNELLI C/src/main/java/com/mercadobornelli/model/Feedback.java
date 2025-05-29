package com.mercadobornelli.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_feedback")
    private Long idFeedback;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @OneToOne
    @JoinColumn(name = "id_venda", unique = true)
    private Venda venda;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoFeedback tipo;

    @NotNull
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer nota;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @NotNull
    @Column(name = "dt_feedback", nullable = false)
    private LocalDateTime dataFeedback;

    public enum TipoFeedback {
        ELOGIO, SUGESTAO, RECLAMACAO
    }

    @PrePersist
    protected void onCreate() {
        dataFeedback = LocalDateTime.now();
    }


    public Long getIdFeedback() {
        return idFeedback;
    }

    public void setIdFeedback(Long idFeedback) {
        this.idFeedback = idFeedback;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Venda getVenda() {
        return venda;
    }

    public void setVenda(Venda venda) {
        this.venda = venda;
    }

    public TipoFeedback getTipo() {
        return tipo;
    }

    public void setTipo(TipoFeedback tipo) {
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