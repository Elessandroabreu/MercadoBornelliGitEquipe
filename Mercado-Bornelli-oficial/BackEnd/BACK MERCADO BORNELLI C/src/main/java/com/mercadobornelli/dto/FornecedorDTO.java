package com.mercadobornelli.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class FornecedorDTO {

    private Long idFornecedor;

    @NotBlank(message = "Nome da empresa é obrigatório")
    private String nomeEmpresa;

    @NotBlank(message = "CNPJ é obrigatório")
    @Pattern(regexp = "^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$", message = "CNPJ deve estar no formato 00.000.000/0000-00")
    private String cnpj;

    private String nomeRepresentante;

    @Pattern(regexp = "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$", message = "Telefone deve estar no formato (00) 00000-0000")
    private String telefone;

    @Email(message = "E-mail deve ser válido")
    private String email;

    private String produtosFornecidos;


    public FornecedorDTO() {
    }

    public FornecedorDTO(Long idFornecedor, String nomeEmpresa, String cnpj, String nomeRepresentante,
                         String telefone, String email, String produtosFornecidos) {
        this.idFornecedor = idFornecedor;
        this.nomeEmpresa = nomeEmpresa;
        this.cnpj = cnpj;
        this.nomeRepresentante = nomeRepresentante;
        this.telefone = telefone;
        this.email = email;
        this.produtosFornecidos = produtosFornecidos;
    }


    public Long getIdFornecedor() {
        return idFornecedor;
    }

    public void setIdFornecedor(Long idFornecedor) {
        this.idFornecedor = idFornecedor;
    }

    public String getNomeEmpresa() {
        return nomeEmpresa;
    }

    public void setNomeEmpresa(String nomeEmpresa) {
        this.nomeEmpresa = nomeEmpresa;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getNomeRepresentante() {
        return nomeRepresentante;
    }

    public void setNomeRepresentante(String nomeRepresentante) {
        this.nomeRepresentante = nomeRepresentante;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProdutosFornecidos() {
        return produtosFornecidos;
    }

    public void setProdutosFornecidos(String produtosFornecidos) {
        this.produtosFornecidos = produtosFornecidos;
    }
}