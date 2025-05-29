package com.mercadobornelli.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

public class UsuarioDTO {

    private Long idUsuario;

    @NotBlank(message = "Nome de usuário é obrigatório")
    @Size(min = 3, max = 20, message = "Nome de usuário deve ter entre 3 e 20 caracteres")
    private String username;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String password;

    private Set<String> perfis = new HashSet<>();
    private boolean ativo;

    // Construtores
    public UsuarioDTO() {
    }

    public UsuarioDTO(Long idUsuario, String username, Set<String> perfis, boolean ativo) {
        this.idUsuario = idUsuario;
        this.username = username;
        this.perfis = perfis;
        this.ativo = ativo;
    }

    // Getters e Setters
    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getPerfis() {
        return perfis;
    }

    public void setPerfis(Set<String> perfis) {
        this.perfis = perfis;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}