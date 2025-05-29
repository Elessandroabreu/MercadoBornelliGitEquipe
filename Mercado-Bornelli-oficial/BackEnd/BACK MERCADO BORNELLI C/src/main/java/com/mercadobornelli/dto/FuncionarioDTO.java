package com.mercadobornelli.dto;

import com.mercadobornelli.model.Funcionario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FuncionarioDTO {

    private Long idFuncionario;

    @NotBlank(message = "Nome completo é obrigatório")
    private String nomeCompleto;

    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$", message = "CPF deve estar no formato 000.000.000-00")
    private String cpf;

    @Email(message = "E-mail deve ser válido")
    private String email;

    @Pattern(regexp = "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$", message = "Telefone deve estar no formato (00) 00000-0000")
    private String telefone;

    @NotNull(message = "Cargo é obrigatório")
    private Funcionario.Cargo cargo;

    @NotNull(message = "Status é obrigatório")
    private Funcionario.Status status;

    @NotNull(message = "Data de admissão é obrigatória")
    private LocalDate dataAdmissao;

    @NotNull(message = "Salário é obrigatório")
    @Positive(message = "Salário deve ser maior que zero")
    private BigDecimal salario;


    public FuncionarioDTO() {
    }

    public FuncionarioDTO(Long idFuncionario, String nomeCompleto, String cpf, String email, String telefone,
                          Funcionario.Cargo cargo, Funcionario.Status status, LocalDate dataAdmissao, BigDecimal salario) {
        this.idFuncionario = idFuncionario;
        this.nomeCompleto = nomeCompleto;
        this.cpf = cpf;
        this.email = email;
        this.telefone = telefone;
        this.cargo = cargo;
        this.status = status;
        this.dataAdmissao = dataAdmissao;
        this.salario = salario;
    }


    public Long getIdFuncionario() {
        return idFuncionario;
    }

    public void setIdFuncionario(Long idFuncionario) {
        this.idFuncionario = idFuncionario;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public Funcionario.Cargo getCargo() {
        return cargo;
    }

    public void setCargo(Funcionario.Cargo cargo) {
        this.cargo = cargo;
    }

    public Funcionario.Status getStatus() {
        return status;
    }

    public void setStatus(Funcionario.Status status) {
        this.status = status;
    }

    public LocalDate getDataAdmissao() {
        return dataAdmissao;
    }

    public void setDataAdmissao(LocalDate dataAdmissao) {
        this.dataAdmissao = dataAdmissao;
    }

    public BigDecimal getSalario() {
        return salario;
    }

    public void setSalario(BigDecimal salario) {
        this.salario = salario;
    }
}